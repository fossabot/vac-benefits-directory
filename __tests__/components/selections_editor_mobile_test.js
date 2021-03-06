import React from "react";
import { mount } from "enzyme";
import { SelectionsEditorMobile } from "../../components/selections_editor_mobile";
const { axe, toHaveNoViolations } = require("jest-axe");
expect.extend(toHaveNoViolations);
import benefitEligibilityFixture from "../fixtures/benefitEligibility";
import needsFixture from "../fixtures/needs";
import configureStore from "redux-mock-store";
import questionsFixture from "../fixtures/questions";
import multipleChoiceOptionsFixture from "../fixtures/multiple_choice_options";
import questionDisplayLogicFixture from "../fixtures/question_display_logic";
import questionClearLogicFixture from "../fixtures/question_clear_logic";
import responsesFixture from "../fixtures/responses";
import Router from "next/router";

describe("SelectionsEditorMobile", () => {
  let props;
  let mockStore, reduxData;

  Router.replace = jest.fn().mockImplementation(() => new Promise(() => true));
  beforeEach(() => {
    props = {
      t: key => key,
      profileQuestions: questionsFixture.filter(
        q => q.variable_name !== "needs"
      ),
      responses: responsesFixture,
      saveQuestionResponse: jest.fn(),
      url: {
        query: {
          lng: "en",
          patronType: "veteran",
          serviceType: "RCMP",
          selectedNeeds: "recHB4dscib9fjxso,recIoUeSmWb2pyYaD"
        }
      }
    };
    reduxData = {
      questions: questionsFixture,
      questionDisplayLogic: questionDisplayLogicFixture,
      questionClearLogic: questionClearLogicFixture,
      multipleChoiceOptions: multipleChoiceOptionsFixture,
      selectedNeeds: {},
      needs: needsFixture,
      benefitEligibility: benefitEligibilityFixture,
      pageWidth: 1000
    };
    mockStore = configureStore();
    props.store = mockStore(reduxData);
  });

  it("passes axe tests", async () => {
    let html = mount(
      <SelectionsEditorMobile {...props} {...reduxData} />
    ).html();
    expect(await axe(html)).toHaveNoViolations();
  });

  it("has no clear button if nothing selected", () => {
    props.store = mockStore(reduxData);
    expect(
      mount(<SelectionsEditorMobile {...props} {...reduxData} />)
        .find("#ClearFiltersMobile")
        .first().length
    ).toEqual(0);
  });

  it("has a clear button if patronType has a value", () => {
    props.responses.patronType = "organization";
    props.store = mockStore(reduxData);
    expect(
      mount(<SelectionsEditorMobile {...props} {...reduxData} />)
        .find("#ClearFiltersMobile")
        .first().length
    ).toEqual(1);
  });

  it("has a clear button if selectedNeeds is populated", () => {
    reduxData.selectedNeeds = { foo: "bar" };
    props.store = mockStore(reduxData);
    expect(
      mount(<SelectionsEditorMobile {...props} {...reduxData} />)
        .find("#ClearFiltersMobile")
        .first().length
    ).toEqual(1);
  });

  it("clears data in redux if clear button is clicked", () => {
    let instance = mount(
      <SelectionsEditorMobile {...props} {...reduxData} />
    ).instance();
    instance.clearFilters();
    expect(props.saveQuestionResponse).toBeCalledWith("patronType", "");
    expect(props.saveQuestionResponse).toBeCalledWith("serviceType", "");
    expect(props.saveQuestionResponse).toBeCalledWith("statusAndVitals", "");
    expect(props.saveQuestionResponse).toBeCalledWith("serviceHealthIssue", "");
    expect(props.saveQuestionResponse).toBeCalledWith("selectedNeeds", {});
  });

  it("clears data in url if clear button is clicked", () => {
    let instance = mount(
      <SelectionsEditorMobile {...props} {...reduxData} />
    ).instance();
    instance.clearFilters();
    expect(props.url.query.patronType).toEqual("");
    expect(props.url.query.serviceType).toEqual("");
    expect(props.url.query.statusAndVitals).toEqual("");
    expect(props.url.query.serviceHealthIssue).toEqual("");
    expect(props.url.query.selectedNeeds).toEqual({});
  });

  it("clicking #ClearFiltersMobile runs the clearFilters function", () => {
    reduxData.selectedNeeds = { foo: "bar" };
    let analytics = require("../../utils/analytics");
    analytics.logEvent = jest.fn();
    const mounted = mount(<SelectionsEditorMobile {...props} {...reduxData} />);
    mounted.instance().clearFilters = jest.fn();
    mounted
      .find("#ClearFiltersMobile")
      .first()
      .simulate("click");
    expect(mounted.instance().clearFilters).toBeCalled();
  });

  it("clicking ExpansionPanelSummary runs the toggleOpenState function", () => {
    const mounted = mount(<SelectionsEditorMobile {...props} {...reduxData} />);
    mounted.instance().toggleOpenState = jest.fn();
    mounted
      .find("ExpansionPanelSummary")
      .first()
      .simulate("click");
    expect(mounted.instance().toggleOpenState).toBeCalled();
  });

  it("returns 1 if a profile filter is selected", () => {
    props.responses.patronType = "organization";
    props.store = mockStore(reduxData);
    expect(
      mount(<SelectionsEditorMobile {...props} {...reduxData} />)
        .instance()
        .countSelected()
    ).toEqual(1);
  });

  it("toggles the state with toggleOpenState", () => {
    const mounted = mount(<SelectionsEditorMobile {...props} {...reduxData} />);
    mounted.setState({ open: true });
    mounted.instance().toggleOpenState();
    expect(mounted.state("open")).toEqual(false);
  });
});
