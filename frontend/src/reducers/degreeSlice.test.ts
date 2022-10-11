import reducer, {
  addSpecialisation,
  initialDegreeState,
  removeSpecialisation,
  resetDegree,
  setIsComplete,
  setProgram
} from './degreeSlice';

describe('degreeSlice reducer tests', () => {
  it('tests setProgram reducer', () => {
    expect(
      reducer(undefined, setProgram({ programCode: '3778', programName: 'Computer Science' }))
    ).toEqual({
      ...initialDegreeState,
      programCode: '3778',
      programName: 'Computer Science'
    });
  });

  it('tests addSpecialisation reducer', () => {
    expect(reducer(undefined, addSpecialisation('COMPA1'))).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1']
    });

    const previousState = { ...initialDegreeState, specs: ['COMPA1'] };
    expect(reducer(previousState, addSpecialisation('INFSA2'))).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1', 'INFSA2']
    });
  });

  it('tests removeSpecialisation reducer', () => {
    const previousState = { ...initialDegreeState, specs: ['COMPA1', 'INFSA2'] };
    expect(reducer(previousState, removeSpecialisation('COMPA1'))).toEqual({
      ...initialDegreeState,
      specs: ['INFSA2']
    });
  });

  it('tests removeSpecialisation reducer for non existent specialisation', () => {
    const previousState = { ...initialDegreeState, specs: ['COMPA1'] };
    expect(reducer(previousState, removeSpecialisation('NOTASPEC'))).toEqual({
      ...initialDegreeState,
      specs: ['COMPA1']
    });
  });

  it('tests setIsComplete reducer', () => {
    expect(reducer(undefined, setIsComplete(true))).toEqual({
      ...initialDegreeState,
      isComplete: true
    });
  });

  it('tests resetDegree reducer', () => {
    const previousState = {
      programCode: '3778',
      programName: 'Computer Science',
      specs: ['COMPA1'],
      isComplete: true
    };
    expect(reducer(previousState, resetDegree())).toEqual(initialDegreeState);
  });
});
