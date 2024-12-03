export function dbTodos() {
  return [
    {
      id: "T1",
      content: "Fake Task 1",
      isDone: false,
      ownerId: "P2",
      assignedToId: "P3",
    },
    {
      id: "T2",
      content: "Fake Task 2",
      isDone: false,
      ownerId: "P1",
      assignedToId: "P1",
    },
    {
      id: "T3",
      content: "Fake Task 3",
      isDone: false,
      ownerId: "P4",
      assignedToId: "P3",
    },
    {
      id: "T4",
      content: "Fake Task 4",
      isDone: false,
      ownerId: "P3",
      assignedToId: "P1",
    },
    {
      id: "T5",
      content: "Fake Task 5",
      isDone: false,
      ownerId: "P2",
      assignedToId: "P3",
    },
    {
      id: "T6",
      content: "Fake Task 6",
      isDone: false,
      ownerId: "P3",
      assignedToId: "P1",
    },
  ];
}

export function dbPeople() {
  return [
    {
      id: "P1",
      name: "Fake Person A",
      ownedTodos: [{ id: "T2" }],
      assignedTodos: [{ id: "T2" }, { id: "T4" }, { id: "T6" }],
    },
    {
      id: "P2",
      name: "Fake Person B",
      ownedTodos: [{ id: "T1" }],
      assignedTodos: [{ id: "T5" }],
    },
    {
      id: "P3",
      name: "Fake Person C",
      ownedTodos: [{ id: "T4" }, { id: "T6" }],
      assignedTodos: [{ id: "T1" }, { id: "T43" }, { id: "T5" }],
    },
    {
      id: "P4",
      name: "Fake Person D",
      ownedTodos: [{ id: "T3" }],
      assignedTodos: [],
    },
  ];
}

export function FakeTodos() {
  return [
    {
      id: "T1",
      content: "Fake Task 1",
      isDone: false,
      ownerId: "P2",
      ownerName: "Fake Person B",
      assignedToId: "P3",
      assignedToName: "Fake Person C",
    },
    {
      id: "T2",
      content: "Fake Task 2",
      isDone: false,
      ownerId: "P1",
      ownerName: "Fake Person A",
      assignedToId: "P1",
      assignedToName: "Fake Person A",
    },
    {
      id: "T3",
      content: "Fake Task 3",
      isDone: false,
      ownerId: "P4",
      ownerName: "Fake Person D",
      assignedToId: "P3",
      assignedToName: "Fake Person C",
    },
    {
      id: "T4",
      content: "Fake Task 4",
      isDone: false,
      ownerId: "P3",
      ownerName: "Fake Person C",
      assignedToId: "P1",
      assignedToName: "Fake Person A",
    },
    {
      id: "T5",
      content: "Fake Task 5",
      isDone: false,
      ownerId: "P2",
      ownerName: "Fake Person B",
      assignedToId: "P3",
      assignedToName: "Fake Person C",
    },
    {
      id: "T6",
      content: "Fake Task 6",
      isDone: false,
      ownerId: "P3",
      ownerName: "Fake Person C",
      assignedToId: "P1",
      assignedToName: "Fake Person A",
    },
  ];
}

export function FakePeople() {
  return [
    {
      id: "P1",
      name: "Fake Person A",
      ownedTodos: [
        {
          id: "T2",
          content: "Fake Task 2",
          isDone: false,
          ownerId: "P1",
          assignedToId: "P1",
        },
      ],
      assignedTodos: [
        {
          id: "T2",
          content: "Fake Task 2",
          isDone: false,
          ownerId: "P1",
          assignedToId: "P1",
        },
        {
          id: "T4",
          content: "Fake Task 4",
          isDone: false,
          ownerId: "P3",
          assignedToId: "P1",
        },
        {
          id: "T6",
          content: "Fake Task 6",
          isDone: false,
          ownerId: "P3",
          assignedToId: "P1",
        },
      ],
    },

    {
      id: "P2",
      name: "Fake Person B",
      ownedTodos: [
        {
          id: "T1",
          content: "Fake Task 1",
          isDone: false,
          ownerId: "P2",
          assignedToId: "P3",
        },
        {
          id: "T5",
          content: "Fake Task 5",
          isDone: false,
          ownerId: "P2",
          assignedToId: "P3",
        },
      ],
      assignedTodos: [],
    },

    {
      id: "P3",
      name: "Fake Person C",
      ownedTodos: [
        {
          id: "T4",
          content: "Fake Task 4",
          isDone: false,
          ownerId: "P3",
          assignedToId: "P1",
        },
        {
          id: "T6",
          content: "Fake Task 6",
          isDone: false,
          ownerId: "P3",
          assignedToId: "P1",
        },
      ],
      assignedTodos: [
        {
          id: "T1",
          content: "Fake Task 1",
          isDone: false,
          ownerId: "P2",
          assignedToId: "P3",
        },
        {
          id: "T3",
          content: "Fake Task 3",
          isDone: false,
          ownerId: "P4",
          assignedToId: "P3",
        },
        {
          id: "T5",
          content: "Fake Task 5",
          isDone: false,
          ownerId: "P2",
          assignedToId: "P3",
        },
      ],
    },

    {
      id: "P4",
      name: "Fake Person D",
      ownedTodos: [
        {
          id: "T3",
          content: "Fake Task 3",
          isDone: false,
          ownerId: "P4",
          assignedToId: "P3",
        },
      ],
      assignedTodos: [],
    },
  ];
}
