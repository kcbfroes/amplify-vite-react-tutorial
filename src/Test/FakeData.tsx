
export function FakeTodos() {
    return ([
      { id: 'T1', content: 'Fake Task 1', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
      { id: 'T2', content: 'Fake Task 2', isDone: false, ownerId: 'P1', assignedToId: 'P1' },
      { id: 'T3', content: 'Fake Task 3', isDone: false, ownerId: 'P4', assignedToId: 'P3' },
      { id: 'T4', content: 'Fake Task 4', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
      { id: 'T5', content: 'Fake Task 5', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
      { id: 'T6', content: 'Fake Task 6', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
    ])
  }

  export function FakePeople() {
    return ([
      { id: 'P1', 
        name: 'Fake Person A', 
        ownedTodos: [
            { id: 'T2', content: 'Fake Task 2', isDone: false, ownerId: 'P1', assignedToId: 'P1' },
        ], 
        assignedTodos: [
          { id: 'T2', content: 'Fake Task 2', isDone: false, ownerId: 'P1', assignedToId: 'P1' },
          { id: 'T4', content: 'Fake Task 4', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
          { id: 'T6', content: 'Fake Task 6', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
        ]  
      },
  
      { id: 'P2', 
        name: 'Fake Person B', 
        ownedTodos: [
          { id: 'T1', content: 'Fake Task 1', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
          { id: 'T5', content: 'Fake Task 5', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
        ], 
        assignedTodos: []  
      },
  
      { id: 'P3', 
        name: 'Fake Person C', 
        ownedTodos: [
          { id: 'T4', content: 'Fake Task 4', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
          { id: 'T6', content: 'Fake Task 6', isDone: false, ownerId: 'P3', assignedToId: 'P1' },
        ], 
        assignedTodos: [
          { id: 'T1', content: 'Fake Task 1', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
          { id: 'T3', content: 'Fake Task 3', isDone: false, ownerId: 'P4', assignedToId: 'P3' },
          { id: 'T5', content: 'Fake Task 5', isDone: false, ownerId: 'P2', assignedToId: 'P3' },
        ]  
      },
  
      { id: 'P4', 
        name: 'Fake Person D', 
        ownedTodos: [
          { id: 'T3', content: 'Fake Task 3', isDone: false, ownerId: 'P4', assignedToId: 'P3' },
        ], 
        assignedTodos: [
  
        ]  
      },
    ])
  }