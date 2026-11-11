import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { certificateService } from '../services/certificate.service.js';

export class CertificateController {
  async issue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const result = await certificateService.issueCertificatesForEvent(
        req.user!.id,
        eventId
      );
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const certificate = await certificateService.getCertificateByCode(code);
      res.status(200).json({
        success: true,
        data: { certificate },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificates = await certificateService.getUserCertificates(req.user!.id);
      res.status(200).json({
        success: true,
        data: { certificates },
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const pdfBuffer = await certificateService.downloadCertificatePDF(code);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${code}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const certificateController = new CertificateController();
