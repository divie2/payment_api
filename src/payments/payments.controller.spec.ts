import { describe, it, expect, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

describe('PaymentsController', () => {
  it('findOne throws NotFoundException when the payment does not exist', async () => {
    // Arrange: a fake SERVICE (not a fake pool!) whose findOne finds nothing
    const fakeService = { findOne: vi.fn().mockResolvedValue(undefined ) };
    const controller = new PaymentsController(fakeService as unknown as PaymentsService);

    // Act + Assert: the controller should turn "nothing" into a 404 error
    await expect(controller.findOne('any-id')).rejects.toThrow(NotFoundException);
  });

    it('findOne returns the payment when it exists', async () => {
    const payment = { id: 'abc-123', amountKobo: 5000 /* ...any fields */ };
    const fakeService = { findOne: vi.fn().mockResolvedValue(payment) };
    const controller = new PaymentsController(fakeService as unknown as PaymentsService);

    const result = await controller.findOne('abc-123');

    expect(result).toBe(payment);
  });


});
