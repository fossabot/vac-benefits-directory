import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Highlighter from "react-highlight-words";
import FavouriteButton from "./favourite_button_b";
import { logEvent } from "../utils/analytics";
import { connect } from "react-redux";

const styles = theme => ({
  needsTag: {
    marginRight: theme.spacing.unit,
    backgroundColor: "#364150",
    color: "white",
    borderRadius: 2,
    display: "inline-flex",
    padding: "4px 6px"
  },
  button: {
    marginTop: "30px"
  },
  cardDescriptionText: {
    fontSize: "20px",
    fontWeight: 400,
    padding: "15px 0px"
  },
  collapse: {
    paddingTop: "25px"
  },
  root: {
    width: "100%"
  },
  ExpansionPanelClosed: {
    borderLeft: "5px solid"
  },
  ExpansionPanelOpen: {
    borderLeft: "5px solid #808080"
  },
  ExpansionPanelSummary: {
    "&[aria-expanded*=true]": {
      backgroundColor: "#f8f8f8"
    },
    userSelect: "inherit"
  },
  ChildBenefitDesc: {
    paddingBottom: "30px"
  },
  children: {
    width: "100%"
  },
  ExampleDesc: {
    paddingBottom: "10px"
  },
  examples: {
    width: "100%",
    marginLeft: "20px"
  },
  benefitName: {
    fontWeight: 500
  }
});

export class BenefitCardB extends Component {
  state = {
    open: false
  };
  children = [];
  logExit = url => {
    logEvent("Exit", url);
  };

  toggleOpenState = () => {
    this.setState(previousState => {
      return { ...previousState, open: !previousState.open };
    });
  };

  componentDidMount() {
    this.props.onRef(this);
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  render() {
    const benefit = this.props.benefit;
    const { t, classes } = this.props;

    // we'll probably need these in the header / footer when that gets added
    //
    // const childBenefits = benefit.childBenefits
    //   ? this.props.allBenefits.filter(
    //       ab => benefit.childBenefits.indexOf(ab.id) > -1
    //     )
    //   : [];
    //
    // const veteranBenefits = childBenefits.filter(
    //   ab => this.props.veteranBenefitIds.indexOf(ab.id) > -1
    // );
    // const familyBenefits = childBenefits.filter(
    //   ab => this.props.familyBenefitIds.indexOf(ab.id) > -1
    // );

    const examples =
      typeof benefit.examples !== "undefined" &&
      typeof this.props.examples !== "undefined"
        ? this.props.examples.filter(ex => benefit.examples.indexOf(ex.id) > -1)
        : [];

    const needsMet = benefit.needs
      ? this.props.needs.filter(
          need =>
            benefit.needs.indexOf(need.id) > -1 &&
            this.props.selectedNeeds[need.id]
        )
      : [];

    return (
      <Grid item xs={12}>
        <div className={classes.root}>
          <ExpansionPanel
            className={
              this.state.open
                ? classes.ExpansionPanelOpen
                : classes.ExpansionPanelClosed
            }
            expanded={this.state.open}
          >
            <ExpansionPanelSummary
              className={classes.ExpansionPanelSummary}
              expandIcon={this.state.open ? <RemoveIcon /> : <AddIcon />}
              onClick={() => this.toggleOpenState()}
            >
              <div>
                <div component="p" className={classes.benefitName}>
                  <Highlighter
                    searchWords={this.props.searchString.split(",")}
                    autoEscape={true}
                    textToHighlight={
                      this.props.t("current-language-code") === "en"
                        ? benefit.vacNameEn
                        : benefit.vacNameFr
                    }
                  />
                </div>

                <Typography
                  className={"cardDescription " + classes.cardDescriptionText}
                >
                  <Highlighter
                    searchWords={this.props.searchString.split(",")}
                    autoEscape={true}
                    textToHighlight={
                      this.props.t("current-language-code") === "en"
                        ? benefit.oneLineDescriptionEn
                        : benefit.oneLineDescriptionFr
                    }
                  />
                </Typography>
                <div>
                  {needsMet.map(need => (
                    <div
                      key={benefit.id + need.id}
                      className={classes.needsTag}
                    >
                      {this.props.t("current-language-code") === "en"
                        ? need.nameEn
                        : need.nameFr}
                    </div>
                  ))}
                </div>
                {this.props.showFavourite ? (
                  <FavouriteButton
                    benefit={benefit}
                    toggleOpenState={this.toggleOpenState}
                    store={this.props.store}
                    t={this.props.t}
                  />
                ) : (
                  ""
                )}
              </div>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails timeout="auto" className={classes.collapse}>
              <Grid container spacing={24}>
                <Grid item xs={12}>
                  {examples.length > 0 ? (
                    <Typography className={classes.ExampleDesc}>
                      {t("examples") + ":"}
                    </Typography>
                  ) : (
                    ""
                  )}
                  <Typography className={classes.examples}>
                    {examples.map(ex => {
                      return (
                        <li key={ex.id}>
                          {this.props.t("current-language-code") === "en"
                            ? ex.nameEn
                            : ex.nameFr}{" "}
                        </li>
                      );
                    })}
                  </Typography>

                  <Button
                    className={classes.button}
                    target="_blank"
                    variant="raised"
                    style={{ textTransform: "none" }}
                    onClick={() =>
                      this.logExit(
                        this.props.t("current-language-code") === "en"
                          ? benefit.benefitPageEn
                          : benefit.benefitPageFr
                      )
                    }
                    href={
                      this.props.t("current-language-code") === "en"
                        ? benefit.benefitPageEn
                        : benefit.benefitPageFr
                    }
                  >
                    {this.props.t("Find out more")}
                  </Button>
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </Grid>
    );
  }
}

const mapStateToProps = reduxState => {
  return {
    examples: reduxState.examples,
    needs: reduxState.needs,
    selectedNeeds: reduxState.selectedNeeds
  };
};

BenefitCardB.propTypes = {
  allBenefits: PropTypes.array.isRequired,
  veteranBenefitIds: PropTypes.array.isRequired,
  familyBenefitIds: PropTypes.array.isRequired,
  benefit: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  examples: PropTypes.array.isRequired,
  needs: PropTypes.array.isRequired,
  selectedNeeds: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  showFavourite: PropTypes.bool.isRequired,
  searchString: PropTypes.string.isRequired,
  store: PropTypes.object
};

export default connect(mapStateToProps)(withStyles(styles)(BenefitCardB));