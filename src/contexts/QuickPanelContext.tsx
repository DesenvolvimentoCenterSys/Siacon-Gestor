import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type QuickPanelData = {
  notes: {
    id: number;
    title: string;
    detail: string;
  }[];
  events: {
    id: number;
    title: string;
    detail: string;
  }[];
};

const exampleData: QuickPanelData = {
  notes: [
    {
      id: 1,
      title: 'Best songs to listen while working',
      detail: 'Last edit: May 8th, 2015'
    },
    {
      id: 2,
      title: 'Useful subreddits',
      detail: 'Last edit: January 12th, 2015'
    }
  ],
  events: [
    {
      id: 1,
      title: 'Group Meeting',
      detail: 'In 32 Minutes, Room 1B'
    },
    {
      id: 2,
      title: 'Public Beta Release',
      detail: '11:00 PM'
    },
    {
      id: 3,
      title: 'Dinner with David',
      detail: '17:30 PM'
    },
    {
      id: 4,
      title: 'Q&A Session',
      detail: '20:30 PM'
    }
  ]
};

type QuickPanelContextType = {
  open: boolean;
  data: QuickPanelData;
  toggleQuickPanel: () => void;
  openQuickPanel: () => void;
  closeQuickPanel: () => void;
  removeEvents: () => void;
};

const initialState: QuickPanelContextType = {
  open: false,
  data: exampleData,
  toggleQuickPanel: () => { },
  openQuickPanel: () => { },
  closeQuickPanel: () => { },
  removeEvents: () => { }
};

const QuickPanelContext = createContext<QuickPanelContextType>(initialState);

export const useQuickPanel = () => useContext(QuickPanelContext);

export const QuickPanelProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<QuickPanelData>(exampleData);

  const toggleQuickPanel = useCallback(() => setOpen((prev) => !prev), []);
  const openQuickPanel = useCallback(() => setOpen(true), []);
  const closeQuickPanel = useCallback(() => setOpen(false), []);
  const removeEvents = useCallback(() => {
    setData((prev) => ({ ...prev, events: [] }));
  }, []);

  return (
    <QuickPanelContext.Provider
      value={{
        open,
        data,
        toggleQuickPanel,
        openQuickPanel,
        closeQuickPanel,
        removeEvents
      }}
    >
      {children}
    </QuickPanelContext.Provider>
  );
};

export default QuickPanelContext;
