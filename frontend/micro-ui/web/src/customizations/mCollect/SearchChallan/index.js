import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { config } from "./config";
import SearchChallanComponent from "./searchChallan";

const SearchChallan = () => {
  const { t } = useTranslation();
  const { path } = useRouteMatch();

  const params = useMemo(() =>
    config.map(
      (step) => {
        const texts = {};
        for (const key in step.texts) {
          texts[key] = t(step.texts[key]);
        }
        return { ...step, texts };
      },
      [config]
    )
  );
  console.log("prasad search challen");
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SearchChallanComponent config={params[0]} />
      </Route>
    </Switch>
  );
};

const customize = () => {
  window.Digit.ComponentRegistryService.setComponent(
    "MCollectSearchChallanComponent",    
    SearchChallanComponent
  );
};

export default customize;



