"""Service to publish the functions used in the MRP module routes."""

from datetime import timedelta
from ..models.models import (
    Token,
    User,
    UpdatePassword,
    Message,
    ProductionOrders,
    WorkOrders,
    ReasonsLoss,
    ChangeStateWorkOrder,
    BlockWorkOrder,
    Products,
    AddComponent,
    ConsumeComponent,
)
from typing import Any
import requests
import logging
import json
import os
from viixoo_core.services.base_service import BaseService
from fastapi import Depends, HTTPException
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer
from . import security
import configparser
from dotenv import load_dotenv

_logger = logging.getLogger(__name__)

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/login/access-token")
load_dotenv()

SECRET_KEY = security.SECRET_KEY
config = configparser.ConfigParser()
config_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mrp.conf")
config.read(config_file_path)
URL_ODOO = config.get("settings_odoo", "url_odoo")
TOKEN_ODOO = os.getenv("TOKEN_ODOO", "")


class MrpService(BaseService):
    """MRP service."""

    def __init__(self):
        """Initialize the MrpService class."""
        super().__init__("mrp")

    def authenticate_user(
        self, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
    ) -> Token:
        """Authenticate user."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:

            odoo_response = requests.post(
                URL_ODOO + "/hemago/authenticate_user/",
                headers=headers,
                data=json.dumps(
                    {"user_login": form_data.username, "password": form_data.password}
                ),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            error_str = str(e)
            _logger.error("Ha ocurrido un error al enviar la solicitud a Odoo")
            _logger.error(error_str)
            raise HTTPException(
                status_code=401, detail="Usuario o contraseña incorrecto"
            )
        else:
            response = json.loads(odoo_response.text)
            if response.get("employee"):
                employee = response["employee"]
                access_token_expires = timedelta(minutes=600)
                return Token(
                    access_token=security.create_access_token(
                        employee["id"], expires_delta=access_token_expires
                    )
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="No fue encontrado ningún usuario con las credenciales proporcionadas",
                )

    def get_user(self, token: Annotated[str, Depends(reusable_oauth2)]) -> User:
        """Get user data."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            else:
                odoo_response = requests.get(
                    URL_ODOO + "/hemago/get_employee/",
                    headers=headers,
                    data=json.dumps({"employee_id": payload.get("sub")}),
                    verify=True,
                    timeout=100,
                )
        except Exception as e:
            detail = e.detail if e.detail else "Usuario no encontrado"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("employee"):
                employee = response["employee"]
                return User(full_name=employee["name"], email=employee["email"])

    def reset_password(
        self, token: Annotated[str, Depends(reusable_oauth2)], body: UpdatePassword
    ) -> Any:
        """Reset password."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "new_password": body.new_password,
                "current_password": body.current_password,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/reset_password/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Usuario no encontrado"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Contraseña cambiada satisfactoriamente")
            else:
                raise HTTPException(status_code=500, detail="Acceso denegado")

    def get_production_orders(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        order_search: str = False,
        show_all_state: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> Any:
        """Get production orders."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "order_search": order_search,
                "show_all_state": show_all_state,
                "lang": "es_MX",
                "start": skip,
                "limit": limit,
            }
            odoo_response = requests.get(
                URL_ODOO + "/hemago/get_production_order/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = (
                e.detail
                if e.detail
                else "Ha ocurrido un error al enviar la solicitud a Odoo"
            )
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return ProductionOrders(
                    data=response.get("production_order_ids"),
                    count=response.get("count"),
                )
            else:
                raise HTTPException(status_code=500)

    def get_workorders(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        order_search: str = False,
        show_all_state: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> Any:
        """Get work orders."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "order_search": order_search,
                "show_all_state": show_all_state,
                "lang": "es_MX",
                "start": skip,
                "limit": limit,
            }
            odoo_response = requests.get(
                URL_ODOO + "/hemago/get_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = (
                e.detail
                if e.detail
                else "Ha ocurrido un error al enviar la solicitud a Odoo"
            )
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return WorkOrders(
                    data=response.get("workorder_ids"), count=response.get("count")
                )
            else:
                raise HTTPException(status_code=500)

    def get_reasons_loss(self, token: Annotated[str, Depends(reusable_oauth2)]) -> Any:
        """Get reasons loss."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            odoo_response = requests.get(
                URL_ODOO + "/hemago/get_reasons_loss/",
                headers=headers,
                verify=True,
                timeout=100,
            )
        except Exception as e:
            error_str = str(e)
            _logger.error("Ha ocurrido un error al enviar la solicitud a Odoo")
            _logger.error(error_str)
            raise HTTPException(
                status_code=400,
                detail="Ha ocurrido un error al enviar la solicitud a Odoo",
            )
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return ReasonsLoss(data=response.get("loss_ids"))
            else:
                raise HTTPException(status_code=500)

    def get_products(self, token: Annotated[str, Depends(reusable_oauth2)]) -> Any:
        """Get products."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            odoo_response = requests.get(
                URL_ODOO + "/hemago/get_products/",
                headers=headers,
                verify=True,
                timeout=100,
            )
        except Exception as e:
            error_str = str(e)
            _logger.error("Ha ocurrido un error al enviar la solicitud a Odoo")
            _logger.error(error_str)
            raise HTTPException(
                status_code=400,
                detail="Ha ocurrido un error al enviar la solicitud a Odoo",
            )
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Products(data=response.get("product_ids"))
            else:
                raise HTTPException(status_code=500)

    def start_workorder(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        body: ChangeStateWorkOrder,
    ) -> Any:
        """Start workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/start_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Orden de trabajo iniciada satisfactoriamente")
            else:
                raise HTTPException(status_code=400, detail="Orden no encontrada")

    def block_workorder(
        self, token: Annotated[str, Depends(reusable_oauth2)], body: BlockWorkOrder
    ) -> Any:
        """Block workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
                "loss_id": body.loss_id,
                "description": body.description,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/block_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Orden de trabajo bloqueada satisfactoriamente")
            else:
                raise HTTPException(status_code=400, detail="Orden no encontrada")

    def finish_workorder(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        body: ChangeStateWorkOrder,
    ) -> Any:
        """Finish workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/finish_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Orden de trabajo finalizada satisfactoriamente")
            else:
                return Message(message=response.get("detail"))

    def pause_workorder(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        body: ChangeStateWorkOrder,
    ) -> Any:
        """Pause workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/pause_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Orden de trabajo pausada satisfactoriamente")
            else:
                raise HTTPException(status_code=400, detail="Orden no encontrada")

    def unblock_workorder(
        self,
        token: Annotated[str, Depends(reusable_oauth2)],
        body: ChangeStateWorkOrder,
    ) -> Any:
        """Unblock workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/unblock_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(
                    message="Orden de trabajo desbloqueada satisfactoriamente"
                )
            else:
                raise HTTPException(status_code=400, detail="Orden no encontrada")

    def add_components_workorder(
        self, token: Annotated[str, Depends(reusable_oauth2)], body: AddComponent
    ) -> Any:
        """Add components workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "workorder_id": body.workorder_id,
                "product_id": body.product_id,
                "product_qty": body.quantity,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/add_components_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Orden no encontrada"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Componente agregado satisfactoriamente")
            else:
                raise HTTPException(status_code=400, detail="Orden no encontrada")

    def consume_component_workorder(
        self, token: Annotated[str, Depends(reusable_oauth2)], body: ConsumeComponent
    ) -> Any:
        """Consume components workorder."""
        headers = {
            "Auth-Token": TOKEN_ODOO,
            "Content-Type": "application/json",
        }
        try:
            payload = security.get_payload(token)
            if not payload:
                raise HTTPException(status_code=403, detail="Usuario no autenticado")
            data = {
                "employee_id": payload.get("sub"),
                "move_id": body.move_raw_id,
                "picked": body.consumed,
            }
            odoo_response = requests.post(
                URL_ODOO + "/hemago/consume_component_workorder/",
                headers=headers,
                data=json.dumps(data),
                verify=True,
                timeout=100,
            )
        except Exception as e:
            detail = e.detail if e.detail else "Componente no encontrado"
            status_code = e.status_code if e.status_code else 400
            error_str = str(e)
            _logger.error(error_str)
            raise HTTPException(status_code=status_code, detail=detail)
        else:
            response = json.loads(odoo_response.text)
            if response.get("status") == "success":
                return Message(message="Componente consumido satisfactoriamente")
            else:
                raise HTTPException(status_code=400, detail="Componente no encontrado")
