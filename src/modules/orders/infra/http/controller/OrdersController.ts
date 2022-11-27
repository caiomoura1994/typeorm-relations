import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService, { ICreateOrderServiceRequest } from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.body;
    const findedOrder = await container.resolve(FindOrderService).execute({ id })
    return response.json(findedOrder)
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const bodyRequest: ICreateOrderServiceRequest = request.body;
    const createdOrder = await container.resolve(CreateOrderService).execute(bodyRequest)
    return response.json(createdOrder)
  }
}
