const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default messageReducer;
