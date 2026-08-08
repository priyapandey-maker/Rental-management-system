import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/address.service';
import { validateString, validateOptionalString, validateOptionalBoolean, validateEnum } from '../utils/validators';

const addressService = new AddressService();

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const customerId = validateString(req.params.customerId, 'customerId', 1, 36);
    const type = validateEnum(req.body.type, 'type', ['billing', 'shipping', 'primary', 'other']);
    const address_line1 = validateString(req.body.address_line1, 'address_line1', 1, 255);
    const address_line2 = validateOptionalString(req.body.address_line2, 'address_line2', 255);
    const city = validateString(req.body.city, 'city', 1, 100);
    const state = validateString(req.body.state, 'state', 1, 100);
    const postal_code = validateString(req.body.postal_code, 'postal_code', 1, 20);
    const country = validateOptionalString(req.body.country, 'country', 100) ?? undefined;
    const is_default = validateOptionalBoolean(req.body.is_default, 'is_default') ?? undefined;

    const address = await addressService.createAddress(orgId, customerId, {
      type,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default
    });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

export const getAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const address = await addressService.getAddressById(id, orgId);
    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const type = req.body.type !== undefined ? validateEnum(req.body.type, 'type', ['billing', 'shipping', 'primary', 'other']) : undefined;
    const address_line1 = validateOptionalString(req.body.address_line1, 'address_line1', 255);
    const address_line2 = validateOptionalString(req.body.address_line2, 'address_line2', 255);
    const city = validateOptionalString(req.body.city, 'city', 100);
    const state = validateOptionalString(req.body.state, 'state', 100);
    const postal_code = validateOptionalString(req.body.postal_code, 'postal_code', 20);
    const country = validateOptionalString(req.body.country, 'country', 100);
    const is_default = validateOptionalBoolean(req.body.is_default, 'is_default');

    const address = await addressService.updateAddress(id, orgId, {
      type,
      address_line1: address_line1 ?? undefined,
      address_line2,
      city: city ?? undefined,
      state: state ?? undefined,
      postal_code: postal_code ?? undefined,
      country: country ?? undefined,
      is_default: is_default ?? undefined
    });
    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const listAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const customerId = validateString(req.params.customerId, 'customerId', 1, 36);
    const addresses = await addressService.listAddresses(customerId, orgId);
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};
