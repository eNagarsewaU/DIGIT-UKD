import React from "react";
import { Link } from "react-router-dom";
import Field from "egov-ui-kit/utils/field";
//import Icon from "@material-ui/core/Icon";
import { Button, Card, Image,Icon} from "components";
import IconButton from "material-ui/IconButton";
import Label from "egov-ui-kit/utils/translationNode";
import { CityPicker } from "modules/common";
import Hidden from "@material-ui/core/Hidden";
import { startSMSRecevier } from "egov-ui-kit/utils/commons";
import logo from "egov-ui-kit/assets/images/logo_black.png";
import qrlogo from "egov-ui-kit/assets/images//qrImage.png";
import "./index.css";

const iconButtonStyle = {
  paddingLeft: 0,
  paddingRight: 0,
  width: 35,
};

const RegisterForm = ({ handleFieldChange, form,logoUrl ,qrCodeURL,enableWhatsApp}) => {
  const fields = form.fields || {};
  const submit = form.submit;
  return (
    <div className="rainmaker-displayInline">
    <Card
      className={enableWhatsApp?"register-cardwidth user-screens-card":"col-sm-offset-4 col-sm-4 user-screens-card"}
      textChildren={
        <div>
          <div className="web-user-logo" style={{ marginBottom: "24px" }}>
            <Image className="mseva-logo employee-login-logo" source={logoUrl?logoUrl:`${logo}`} />
          </div>
          <Label className="heading text-center" bold={true} dark={true} fontSize={16} label="CORE_REGISTER_HEADING" />
          <Field fieldKey="phone" field={fields.phone} handleFieldChange={handleFieldChange} />
          <Field fieldKey="name" field={fields.name} handleFieldChange={handleFieldChange} />
          <CityPicker onChange={handleFieldChange} fieldKey="city" field={fields.city} />
          <div style={{ marginBottom: "24px", position: "relative", zIndex: 10 }} className="text-right">
            <Label id="otp-trigger" className="otp-prompt" label="CORE_REGISTER_HAVE_ACCOUNT" />
            <Link to="/user/login">
              <div style={{ display: "inline-block" }}>
                <Label containerStyle={{ cursor: "pointer" }} id="otp-resend" className="otp-resend" label="CORE_COMMON_LOGIN" />
              </div>
            </Link>
          </div>
          <Button
            primary={true}
            fullWidth={true}
            {...submit}
            onClick={(e) => {
              startSMSRecevier();
            }}
          />
          {enableWhatsApp&&
        <Hidden mdUp>
          <div>
        <div className="register-hl-divider">
       <div className ="register-circle-mobile">
       <Label  color="black" fontSize= "16px" label="Or"/>
       </div>
    </div>
    <div className="rainmaker-displayInline register-mobile-whatsapp-button" onClick={()=>{window.location.href="https://api.whatsapp.com/send?phone=918744960111s&text=mseva"}} >      
        <Icon action="custom" name="whatsapp" className="register-mobile-whatsapp-icon" />
        <Label bold={true} color="black" fontSize= "14px" label="WHATSAPP_CONTINUE_MOBILE"/>
    </div>
    </div>
      </Hidden>
      }
        </div>
      }
    />
     {enableWhatsApp&&
    <Hidden smDown>
     <div className="register-vl-divider">
       <div className ="register-circle-web">
       <Label  color="black" fontSize= "16px" label="OR"/>
       </div>
    </div>
    <div className="register-qrscan">
       <Image className="register-qrlogo" source={`${qrCodeURL}`} />
      
       <div  className="register-qrtext">
       <Label  color="black" fontSize= "14px" label="WHATSAPP_SCAN_QR_CODE"/>
       </div>
    </div>
    </Hidden>
}
    </div>
  );
};

export default RegisterForm;
