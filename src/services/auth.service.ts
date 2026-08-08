import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthenticationError, ValidationError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'rental_demo_jwt_secret_hackathon';

export class AuthService {
  private authRepo = new AuthRepository();

  private generateToken(userId: string, orgId: string) {
    return jwt.sign({ userId, orgId }, JWT_SECRET, { expiresIn: '24h' });
  }

  async registerUser(data: { email: string; password: string; firstName: string; lastName: string }) {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new ValidationError('Missing required fields');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Provide a personal organization for a generic user to satisfy tenant boundaries
    const code = `U-${Date.now().toString().slice(-6)}`;
    const orgId = await this.authRepo.createOrganization(`${data.firstName} ${data.lastName} (Personal)`, code);

    // Create User
    const userId = await this.authRepo.createUser({
      organizationId: orgId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName
    });

    return { message: 'Registration successful', userId, orgId };
  }

  async registerVendor(data: { email: string; password: string; firstName: string; lastName: string; companyName: string }) {
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.companyName) {
      throw new ValidationError('Missing required fields');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Provide an organization based on the company name
    const code = `V-${Date.now().toString().slice(-6)}`;
    const orgId = await this.authRepo.createOrganization(data.companyName, code);

    // Create User
    const userId = await this.authRepo.createUser({
      organizationId: orgId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName
    });

    return { message: 'Registration successful', userId, orgId };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Missing credentials');
    }

    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid login credentials');
    }

    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AuthenticationError('Invalid login credentials');
    }

    const token = this.generateToken(user.id, user.organization_id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id
      }
    };
  }
}
