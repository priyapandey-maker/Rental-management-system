import { Request, Response, NextFunction } from 'express';
import { InspectionService } from '../services/inspection.service';
import { validateString, validateEnum, validateOptionalString, validateOptionalBoolean } from '../utils/validators';

const inspectionService = new InspectionService();

export const createInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const inspectorId = req.context.userId || 'system';
    const return_line_id = validateString(req.body.return_line_id, 'return_line_id', 3, 36);
    const condition_status = validateEnum(req.body.condition_status, 'condition_status', ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'CRITICAL']);
    const damage_classification = validateOptionalString(req.body.damage_classification, 'damage_classification', 255);
    const damage_severity = validateOptionalString(req.body.damage_severity, 'damage_severity', 30);
    const chargeable_damage = validateOptionalBoolean(req.body.chargeable_damage, 'chargeable_damage') ?? undefined;
    const notes = validateOptionalString(req.body.notes, 'notes', 65535);

    const inspection = await inspectionService.createInspection(orgId, {
      return_line_id,
      condition_status,
      damage_classification,
      damage_severity: damage_severity as any ?? undefined,
      chargeable_damage,
      notes,
      inspector_id: inspectorId
    });
    res.status(201).json(inspection);
  } catch (error) {
    next(error);
  }
};

export const getInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const inspection = await inspectionService.getInspectionById(id, orgId);
    res.json(inspection);
  } catch (error) {
    next(error);
  }
};

export const listInspections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const returnId = validateString(req.params.returnId, 'returnId', 1, 36);
    const inspections = await inspectionService.listInspectionsByReturnId(returnId, orgId);
    res.json(inspections);
  } catch (error) {
    next(error);
  }
};
