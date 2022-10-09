import { setupStore } from 'config/store';
import {
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
      const store = setupStore();
      store.dispatch(addTab('COMP1511'));
      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511'],
        active: 0
      });
    });

    it('adds a new tab and set it as active', () => {
      const store = setupStore();
      store.dispatch(addTab('COMP1511'));
      store.dispatch(addTab('COMP1521'));
      store.dispatch(addTab('COMP1531'));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
        active: 2
      });
    });

    it('set the active tab if the added tab already exists', () => {
      const store = setupStore();
      store.dispatch(addTab('COMP1511'));
      store.dispatch(addTab('COMP1521'));
      store.dispatch(addTab('COMP1531'));
      store.dispatch(addTab('COMP1521'));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
        active: 1
      });
    });
  });

  describe('removeTab reducer', () => {
    it('remains in the initial state when there are no tabs to be removed', () => {
      const store = setupStore();
      store.dispatch(removeTab(0));
      expect(store.getState().courseTabs).toEqual(initialCourseTabsState);
    });

    it('does not remove any tabs if the index is out of scope', () => {
      const store = setupStore({ courseTabs: { tabs: ['COMP1511'], active: 0 } });
      store.dispatch(removeTab(1));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511'],
        active: 0
      });
    });

    it('removes an existing tab', () => {
      const store = setupStore({ courseTabs: { tabs: ['COMP1511'], active: 0 } });
      store.dispatch(removeTab(0));

      expect(store.getState().courseTabs).toEqual(initialCourseTabsState);
    });

    it('removes a non active tab with active index positioned on the correct tab', () => {
      const store = setupStore({
        courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 }
      });
      store.dispatch(removeTab(0));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1521', 'COMP1531'],
        active: 1
      });
    });

    it('removes the first tab (active tab) and set correct active index', () => {
      const store = setupStore({
        courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 0 }
      });
      store.dispatch(removeTab(0));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1521', 'COMP1531'],
        active: 0
      });
    });

    it('removes the middle tab (active tab) and set correct active index', () => {
      const store = setupStore({
        courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 1 }
      });
      store.dispatch(removeTab(1));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511', 'COMP1531'],
        active: 1
      });
    });

    it('removes the last tab (active tab) and set correct active index', () => {
      const store = setupStore({
        courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 }
      });
      store.dispatch(removeTab(2));

      expect(store.getState().courseTabs).toEqual({
        tabs: ['COMP1511', 'COMP1521'],
        active: 1
      });
    });
  });

  it('tests setActiveTab reducer', () => {
    const store = setupStore({
      courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 }
    });
    store.dispatch(setActiveTab(1));

    expect(store.getState().courseTabs).toEqual({
      tabs: ['COMP1511', 'COMP1521', 'COMP1531'],
      active: 1
    });
  });

  it('tests reorderTabs reducer', () => {
    const store = setupStore({
      courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 }
    });
    store.dispatch(reorderTabs(['COMP1531', 'COMP1511', 'COMP1521']));

    expect(store.getState().courseTabs).toEqual({
      tabs: ['COMP1531', 'COMP1511', 'COMP1521'],
      active: 2
    });
  });

  it('tests resetTabs reducer', () => {
    const store = setupStore({
      courseTabs: { tabs: ['COMP1511', 'COMP1521', 'COMP1531'], active: 2 }
    });
    store.dispatch(resetTabs());

    expect(store.getState().courseTabs).toEqual(initialCourseTabsState);
  });
});
