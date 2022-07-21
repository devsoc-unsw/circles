import {
  afterEach, describe, expect, it,
} from "vitest";
import store from "config/store";
import {
  addTab, removeTab, reorderTabs, resetTabs, setActiveTab,
} from "./courseTabsSlice";

const initialState = {
  tabs: [],
  active: 0,
};

afterEach(() => {
  // TODO make this reset store without using this reducer
  store.dispatch(resetTabs());
});

describe("addTab reducer tests", () => {
  it("should add a new tab if there are no tabs", () => {
    store.dispatch(addTab("COMP1511"));
    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511"],
      active: 0,
    });
  });

  it("should add a new tab if there tabs and set it as an active tab", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511", "COMP1521", "COMP1531"],
      active: 2,
    });
  });

  it("should only set active if the added tab already exists", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(addTab("COMP1521"));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511", "COMP1521", "COMP1531"],
      active: 1,
    });
  });
});

describe("removeTab reducer tests", () => {
  it("should be in an initialState if removeTab gets called when there are no tabs", () => {
    store.dispatch(removeTab(0));
    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual(initialState);
  });

  it("should not remove a tab if index is out of scope", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(removeTab(5));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511"],
      active: 0,
    });
  });

  it("should remove an existing tab", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(removeTab(0));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual(initialState);
  });

  it("should remove a non active tab and active should be positioned on the active tab", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));
    store.dispatch(removeTab(0));

    const { courseTabs } = store.getState();

    expect(courseTabs).toEqual({
      tabs: ["COMP1521", "COMP1531"],
      active: 1,
    });
  });

  it("should remove an the first tab (active tab) and set correct active index", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(setActiveTab(0));

    store.dispatch(removeTab(0));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1521", "COMP1531"],
      active: 0,
    });
  });

  it("should remove an the middle tab (active tab) and set correct active index", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(setActiveTab(1));

    store.dispatch(removeTab(1));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511", "COMP1531"],
      active: 1,
    });
  });

  it("should remove an the last tab (active tab) and set correct active index", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(setActiveTab(2));

    store.dispatch(removeTab(2));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511", "COMP1521"],
      active: 1,
    });
  });
});

describe("setActiveTab reducer tests", () => {
  it("should set active tab", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(setActiveTab(1));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1511", "COMP1521", "COMP1531"],
      active: 1,
    });
  });
});

describe("reorderTabsreorderTabs reducer tests", () => {
  it("should reorder tabs", () => {
    store.dispatch(addTab("COMP1511"));
    store.dispatch(addTab("COMP1521"));
    store.dispatch(addTab("COMP1531"));

    store.dispatch(reorderTabs(["COMP1531", "COMP1511", "COMP1521"]));

    const { courseTabs } = store.getState();
    expect(courseTabs).toEqual({
      tabs: ["COMP1531", "COMP1511", "COMP1521"],
      active: 2,
    });
  });
});
