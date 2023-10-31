export type Card = {
    number: string;
    expire_date: string;
    cvv: string;
    failMessage: string;
  };

export type ShippingAddress = {
  email?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  phone_number?: string;
  cpf_cnpj_number?: string;
  country_code?: string;
  social_id?: string;
}

export type ShippingMethod = {
  carrier_code?: string;
  amount?: number;
  method_title?: string;
  method_code?: string;
  shipping_rule_id?: number;
  shipping_rule_type?: string;
  origin_price?: number;
  min_only_shipping_time?: number;
  max_only_shipping_time?: number;
  min_only_shipping_time_estimated_by_day?: number;
  max_only_shipping_time_estimated_by_day?: number;
  shipping_group_code?: string;
  shipping_include_insurance?: boolean;
  shipping_fee?: number;
  origin_shipping_fee?: number;
  must_equal?: boolean;
  max_processing_time_estimated_by_day?: number;
  min_processing_time_estimated_by_day?: number;
};