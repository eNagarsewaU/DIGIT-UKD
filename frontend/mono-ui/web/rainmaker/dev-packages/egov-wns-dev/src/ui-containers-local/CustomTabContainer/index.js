import React from "react";
import RenderScreen from "egov-ui-framework/ui-molecules/RenderScreen";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import CustomTab from "../../ui-molecules-local/CustomTab";
import { connect } from "react-redux";
import { addComponentJsonpath } from "egov-ui-framework/ui-utils/commons";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import cloneDeep from "lodash/cloneDeep";

class MultiItem extends React.Component {
  state = { tabIndex: 0 };

  setInstrumentType = (value, dispatch) => {
    dispatch(prepareFinalObject("currentTab", value));
    if (value === "SEARCH_CONNECTION") {
      dispatch(handleField("search", "components.div.children.searchApplicationResults", "visible", false));
    } else {
      dispatch(handleField("search", "components.div.children.searchResults", "visible", false));
    }
  };

  onTabChange = (tabIndex, dispatch, state) => {
    switch (tabIndex) {
      case 0:
        this.setInstrumentType("SEARCH_CONNECTION", dispatch);
        break;
      case 1:
        this.setInstrumentType("SEARCH_APPLICATION", dispatch);
        break;
      default:
        this.setInstrumentType("SEARCH_CONNECTION", dispatch);
        break;
    }
  };

  onTabClick = tabIndex => {
    const { state, dispatch } = this.props;
    this.onTabChange(tabIndex, dispatch, state);
    this.setState({ tabIndex });
  };

  render() {
    const {
      uiFramework,
      onFieldChange,
      onComponentClick,
      screenKey,
      componentJsonpath
    } = this.props;

    const { onTabClick } = this;

    const transFormedProps = {
      ...this.props,
      tabs: this.props.tabs.map((tab, key) => {
        return {
          ...tab,
          tabContent: (
            <RenderScreen
              key={key}
              screenKey={screenKey}
              components={cloneDeep(
                addComponentJsonpath(
                  tab.tabContent,
                  `${componentJsonpath}.props.tabs[${key}].tabContent`
                )
              )}
              uiFramework={uiFramework}
              onFieldChange={onFieldChange}
              onComponentClick={onComponentClick}
            />
          )
        };
      })
    };
    return <CustomTab handleClick={onTabClick} {...transFormedProps} />;
  }
}

const mapStateToProps = state => {
  const { screenConfiguration } = state;
  const { screenConfig, preparedFinalObject } = screenConfiguration;
  return { screenConfig, preparedFinalObject, state };
};

export default connect(mapStateToProps)(MultiItem);
