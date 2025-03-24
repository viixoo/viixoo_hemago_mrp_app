// This file is auto-generated by @hey-api/openapi-ts

export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type TimeEmployeePublic = {
  time_id: number
  employee: string
  employee_id: number
  duration: number
  date_start: string
  date_end: string | null
  loss: string
}

export type WorkOrderPublic = {
  workorder_id: number
  name: string
  product: string
  workcenter: string
  production_state: string
  working_state: string
  is_user_working: boolean
  quality_state: string | null
  test_type: string | ""
  qty_production: number
  qty_produced: number
  qty_producing: number
  qty_remaining: number
  duration_expected: number
  duration: number
  state: string
  state_value: string
  date_start: string
  date_finished: string | null
  url_document_instructions: string | null
  urls_plans: string | null
  time_ids: Array<TimeEmployeePublic>
}

export type ReasonLossPublic = {
  value: number
  label: string
}

export type ComponentPublic = {
  move_raw_id: number
  product: string
  quantity: number
  product_uom_qty: number
}

export type ProductionOrderPublic = {
  production_id: number
  name: string
  product: string
  date_start: string
  date_finished: string | null
  product_qty: number | null
  state: string
  bom: string | null
  workorder_ids: Array<WorkOrderPublic>
  move_raw_ids: Array<ComponentPublic>
}

export type ProductionOrdersPublic = {
  data: Array<ProductionOrderPublic>
  count: number
}

export type WorkOrdersPublic = {
  data: Array<WorkOrderPublic>
  count: number
}

export type ReasonsLossPublic = {
  data: Array<ReasonLossPublic>
}

export type Message = {
  message: string
}

export type NewPassword = {
  token: string
  new_password: string
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type ChangeStateWorkOrder = {
  workorder_id: number
}

export type BlockWorkOrder = {
  workorder_id: number
  loss_id: number
  description: string | null
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: string
}

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type ItemsReadItemsData = {
  limit?: number
  skip?: number
}

export type ItemsReadItemsResponse = ProductionOrdersPublic

export type WorkOrdersReadItemsResponse = WorkOrdersPublic

export type ReasonsLossReadItemsResponse = ReasonsLossPublic

export type ItemsCreateItemResponse = ProductionOrderPublic

export type ItemsReadItemData = {
  id: string
}

export type ItemsReadItemResponse = ProductionOrderPublic

export type LoginLoginAccessTokenData = {
  formData: Body_login_login_access_token
}

export type LoginLoginAccessTokenResponse = Token

export type LoginTestTokenResponse = UserPublic

export type LoginRecoverPasswordData = {
  email: string
}

export type LoginRecoverPasswordResponse = Message

export type LoginResetPasswordData = {
  requestBody: NewPassword
}

export type LoginResetPasswordResponse = Message

export type LoginRecoverPasswordHtmlContentData = {
  email: string
}

export type LoginRecoverPasswordHtmlContentResponse = string

export type UsersReadUsersResponse = UsersPublic

export type UsersReadUserMeResponse = UserPublic

export type UsersUpdatePasswordMeData = {
  requestBody: UpdatePassword
}

export type ChangeStateWorkOrderData = {
  requestBody: ChangeStateWorkOrder
}

export type BlockWorkOrderData = {
  requestBody: BlockWorkOrder
}

export type UsersUpdatePasswordMeResponse = Message

export type ChangeStateResponse = Message

export type UsersRegisterUserResponse = UserPublic

export type UsersReadUserByIdData = {
  userId: string
}

export type UsersReadUserByIdResponse = UserPublic

export type UsersUpdateUserResponse = UserPublic

export type UsersDeleteUserData = {
  userId: string
}

export type UtilsTestEmailData = {
  emailTo: string
}

export type UtilsTestEmailResponse = Message

export type UtilsHealthCheckResponse = boolean
