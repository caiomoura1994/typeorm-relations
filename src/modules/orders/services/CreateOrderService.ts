import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

export interface ICreateOrderServiceRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: ICreateOrderServiceRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id)
    if (!customer) throw new AppError("Customer not found");
    const findedproducts = await this.productsRepository.findAllById(products)
    if (!findedproducts.length) throw new AppError("Products not founded");
    const onlyProductsIds = findedproducts.map(product => product.id)
    const productsAlreadyRegister = products.filter(product => onlyProductsIds.includes(product.id))
    if (productsAlreadyRegister.length) throw new AppError(`#${productsAlreadyRegister[0].id} Already registered`);
    const productsWithInvalidQuantity = products.filter(product => product.quantity <= (findedproducts.find(p => p.id === product.id)?.quantity || 0))
    if (productsWithInvalidQuantity.length) throw new AppError(`Invalid quantity in product #${productsWithInvalidQuantity[0].id}`);

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      price: findedproducts.find(p => p.id === product.id)?.price || 0,
      quantity: product.quantity,
    }))
    const updateProductQuantitySerializer = products.map(sp => ({
      ...sp,
      quantity: (findedproducts.find(p => p.id === sp.id)?.quantity || 0) - sp.quantity,
    }))
    await this.productsRepository.updateQuantity(updateProductQuantitySerializer)
    const createdOrder = await this.ordersRepository.create({
      customer,
      products: serializedProducts
    })
    return createdOrder;
  }
}

export default CreateOrderService;
