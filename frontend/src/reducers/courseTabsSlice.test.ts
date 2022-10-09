import reducer, {
  addTab,
  initialCourseTabsState,
  removeTab,
  reorderTabs,
  resetTabs,
  setActiveTab
} from './courseTabsSlice';

describe('courseTabsSlice reducer tests', () => {
  describe('addTab reducer', () => {
    it('adds a new tab', () => {
      expect(reducer(undefined, addTab('COMP1511'))).toEqual({
        tabs: ['COMP1511'],
        active: 0
      });
    });

    it('adds a new tab and set it as active', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521'], active: 0 };

      expect(reducer(previousState, addTab('COMP1531'))).toEqual({
        tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
        active: 2
      });
    });

    it('set the active tab if the added tab already exists', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

      expect(reducer(previousState, addTab('COMP1521'))).toEqual({
        tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
        active: 1
      });
    });
  });

  describe('removeTab reducer', () => {
    it('remains in the initial state when there are no tabs to be removed', () => {
      expect(reducer(undefined, removeTab(0))).toEqual(initialCourseTabsState);
    });

    it('does not remove any tabs if the index is out of scope', () => {
      const previousState = { tabs: ['COMP1511'], active: 0 };

      expect(reducer(previousState, removeTab(1))).toEqual({
        tabs: ['COMP1511'],
        active: 0
      });
    });

    it('removes an existing tab', () => {
      const previousState = { tabs: ['COMP1511'], active: 0 };
      expect(reducer(previousState, removeTab(0))).toEqual(initialCourseTabsState);
    });

    it('removes a non active tab with active index positioned on the correct tab', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

      expect(reducer(previousState, removeTab(0))).toEqual({
        tabs: ['COMP1521', 'COMP1531'],
        active: 1
      });
    });

    it('removes the first tab (active tab) and set correct active index', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 0 };

      expect(reducer(previousState, removeTab(0))).toEqual({
        tabs: ['COMP1521', 'COMP1531'],
        active: 0
      });
    });

    it('removes the middle tab (active tab) and set correct active index', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 1 };

      expect(reducer(previousState, removeTab(1))).toEqual({
        tabs: ['COMP1511', 'COMP1531'],
        active: 1
      });
    });

    it('removes the last tab (active tab) and set correct active index', () => {
      const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

      expect(reducer(previousState, removeTab(2))).toEqual({
        tabs: ['COMP1511', 'COMP1521'],
        active: 1
      });
    });
  });

  it('tests setActiveTab reducer', () => {
    const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

    expect(reducer(previousState, setActiveTab(1))).toEqual({
      tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
      active: 1
    });
  });

  it('tests reorderTabs reducer', () => {
    const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

    expect(reducer(previousState, reorderTabs(['COMP1531', 'COMP1511', 'COMP1521']))).toEqual({
      tabs: ['COMP1531', 'COMP1511', 'COMP1521'],
      active: 2
    });
  });

  it('tests resetTabs reducer', () => {
    const previousState = { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 };

    expect(reducer(previousState, resetTabs())).toEqual(initialCourseTabsState);
  });
});
