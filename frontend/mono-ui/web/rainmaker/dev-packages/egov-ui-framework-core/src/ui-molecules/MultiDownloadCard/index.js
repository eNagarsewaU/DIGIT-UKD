import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import { LabelContainer } from "../../ui-containers";
import "./index.css";

const styles = {
  whiteCard: {
    maxWidth: 250,
    backgroundColor: "#FFFFFF",
    paddingLeft: 8,
    paddingRight: 0,
    paddingTop: 11,
    paddingBottom: 0,
    marginRight: 16,
    marginTop: 16
  },
  subtext: {
    paddingTop: 7
  },
  body2: {
    wordWrap: "break-word"
  }
};

const documentTitle = {
  color: "rgba(0, 0, 0, 0.87)",
  fontFamily: "Roboto",
  fontSize: "14px",
  fontWeight: 400,
  letterSpacing: "0.67px",
  lineHeight: "19px"
};
const documentMainTitle = {
  color: "rgba(0, 0, 0, 0.87)",
  fontFamily: "Roboto",
  fontSize: "16px",
  fontWeight: 400,
  letterSpacing: "0.67px",
  lineHeight: "19px"
}

function MultiCardDownloadGrid(props) {
  const { classes, data, ...rest } = props;
  return (
    <Grid container {...rest}>
      {data && data.length && data.map((item, key) => {
        return (
          <Grid
            item
            container
            xs={6}
            sm={4}
            className={
              props.backgroundGrey
                ? classNames(classes.whiteCard, "background-grey")
                : classes.whiteCard
            }
          >
           {item.mainTitle && <Grid xs={12}>
              <LabelContainer
                  labelName={item.mainTitle}
                  labelKey={item.mainTitle}
                  style={documentMainTitle}
                />
            </Grid>}
            <Grid xs={12}>
              <LabelContainer
                  labelName={item.title}
                  labelKey={item.title}
                  style={documentTitle}
                />
            </Grid>
            <Grid container>
              <Grid xs={6} className={classes.subtext}>
                <Typography className={classes.body2}>{item.name}</Typography>
              </Grid>
              <Grid xs={6} align="right">
                <Button target="_blank" href={item.link} color="primary">
                  {item.linkText}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
}

MultiCardDownloadGrid.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  link: PropTypes.array.isRequired,
  linktext: PropTypes.array.isRequired
};

export default withStyles(styles)(MultiCardDownloadGrid);
