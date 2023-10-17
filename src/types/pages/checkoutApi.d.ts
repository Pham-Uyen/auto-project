export type BuyerInfoApi = {
    emailBuyer: string;
    shippingAddress: ShippingAddressApi;
};

export type ShippingAddressApi = {
    address1: string;
    address2?: string;
    city: string;
    company?: string;
    country?: string;
    country_code: string;
    country_name?: string;
    cpf_number?: string;
    cpf_or_cnpj_number?: string;
    first_name?: string;
    last_name: string;
    name?: string;
    phone?: string;
    province?: string;
    province_code?: string;
    sbcn_valid_address?: number;
    zip?: string;
    remember_me?: boolean;
    buyer_accepts_sms?: boolean;
    buyer_change_accepts_sms?: boolean;
  };

  export type Product = {
    id?: number;
    title?: string;
    product_title?: string;
    product_id?: string;
    variant_id?: number;
    variant_title?: string;
    variant_sku?: string;
    quantity?: number;
    option?: string;
    tax_info?: Tax;
    post_purchase_price?: number;
    name?: string;
    price?: number;
    base_name?: string;
    product_type?: string;
    vendor?: string;
    tags?: string;
    handle?: string;
  };

  export type Tax = {
    tax_type: string;
    tax_name: string;
    tax_rate: number;
  };
