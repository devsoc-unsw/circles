import { setupStore } from 'config/store';
import {
  addSpecialisation,
  initialDegreeState,
  removeSpecialisation,
  resetDegree,
  setIsComplete,
  setProgram
} from './degreeSlice';

describe('degreeSlice reducer tests', () => {
  it('tests setProgram reducer', () => {
    const store = setupStore();
    store.dispatch(setProgram({ programCode: '3778', programName: 'Computer Science' }));
    expect(store.getState().degree).toEqual({
      ...initialDegreeState,
      programCode: '3778',
      programName: 'Computer Science'
    });
  });

  it('tests addSpecialisation reducer', () => {
    const store = setupStore();
    store.dispatch(addSpecialisation('COMPA1'));
    expect(store.getState().degree).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1']
    });

    store.dispatch(addSpecialisation('INFSA2'));
    expect(store.getState().degree).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1', 'INFSA2']
    });
  });

  it('tests removeSpecialisation reducer', () => {
    const store = setupStore({ degree: { ...initialDegreeState, specs: ['COMPA1', 'INFSA2'] } });
    store.dispatch(removeSpecialisation('COMPA1'));
    expect(store.getState().degree).toEqual({
      ...initialDegreeState,
      specs: ['INFSA2']
    });
  });

  it('tests removeSpecialisation reducer for non existent specialisation', () => {
    const store = setupStore({ degree: { ...initialDegreeState, specs: ['COMPA1'] } });

    store.dispatch(removeSpecialisation('NOTASPEC'));
    expect(store.getState().degree).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1']
    });
  });

  it('tests setIsComplete reducer', () => {
    const store = setupStore();
    store.dispatch(setIsComplete(true));
    expect(store.getState().degree.isComplete).toEqual(true);
  });

  it('tests resetDegree reducer', () => {
    const store = setupStore({
      degree: {
        programCode: '3778',
        programName: 'Computer Science',
        specs: ['COMPA1'],
        isComplete: true
      }
    });
    store.dispatch(resetDegree());
    expect(store.getState().degree).toEqual(initialDegreeState);
  });
});
