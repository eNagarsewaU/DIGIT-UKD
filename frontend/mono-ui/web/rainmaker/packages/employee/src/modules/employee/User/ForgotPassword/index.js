import React from "react";
import formHoc from "egov-ui-kit/hocs/form";
import { Banner } from "modules/common";
import { Screen } from "modules/common";
import ForgotPasswd from "./components/ForgotPasswd";
import get from "lodash/get";
import { connect } from "react-redux";

const ForgotPasswdHOC = formHoc({ formKey: "employeeForgotPasswd" })(ForgotPasswd);

const ForgotPassword = ({ bannerUrl, logoUrl }) => {
  return (
    <Banner hideBackButton={true} bannerUrl={bannerUrl} logoUrl={logoUrl}>
      <ForgotPasswdHOC logoUrl={logoUrl} />
    </Banner>
  );
};

const mapStateToProps = ({ common }) => {
  const { stateInfoById } = common;
  let bannerUrl = get(stateInfoById, "0.bannerUrl");
  let logoUrl = get(stateInfoById, "0.logoUrl");
  return { bannerUrl, logoUrl };
};

export default connect(
  mapStateToProps,
  null
)(ForgotPassword);
