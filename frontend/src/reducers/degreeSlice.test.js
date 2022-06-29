import store from "config/store";
import {
  addSpecialisation, removeSpecialisation, resetDegree, setIsComplete, setProgram,
} from "./degreeSlice";

const initialState = {
  programCode: "",
  programName: "",
  specs: [],
  isComplete: false,
};

describe("Degree slice redux state tests", () => {
  afterEach(() => {
    // TODO make this reset store without using this reducer
    store.dispatch(resetDegree());
  });

  it("should be initialised to initial state", () => {
    const { degree } = store.getState();
    expect(degree).toEqual(initialState);
  });

  it("should set program code and name", () => {
    store.dispatch(setProgram({ programCode: "3778", programName: "Computer Science" }));
    const { degree } = store.getState();
    expect(degree).toEqual({
      ...initialState,
      programCode: "3778",
      programName: "Computer Science",
    });
  });

  it("should be able to add specialisations", () => {
    store.dispatch(addSpecialisation("COMPA1"));
    let { degree } = store.getState();
    expect(degree).toEqual({
      ...initialState,
      specs: ["COMPA1"],
    });

    store.dispatch(addSpecialisation("INFSA2"));
    degree = store.getState().degree;
    expect(degree).toEqual({
      ...initialState,
      specs: ["COMPA1", "INFSA2"],
    });
  });

  it("should be able to remove a specialisation", () => {
    store.dispatch(addSpecialisation("COMPA1"));
    store.dispatch(addSpecialisation("INFSA2"));
    let { degree } = store.getState();
    expect(degree).toEqual({
      ...initialState,
      specs: ["COMPA1", "INFSA2"],
    });

    store.dispatch(removeSpecialisation("COMPA1"));
    degree = store.getState().degree;
    expect(degree).toEqual({
      ...initialState,
      specs: ["INFSA2"],
    });
  });

  it("should be able to remove non existent specialisation", () => {
    store.dispatch(addSpecialisation("COMPA1"));
    let { degree } = store.getState();

    // removing a non existent spec
    store.dispatch(removeSpecialisation("NOTASPEC"));
    degree = store.getState().degree;
    expect(degree).toEqual({
      ...initialState,
      specs: ["COMPA1"],
    });
  });

  it("should be set isComplete", () => {
    store.dispatch(setIsComplete(true));
    const { degree } = store.getState();
    expect(degree.isComplete).toEqual(true);
  });
});
