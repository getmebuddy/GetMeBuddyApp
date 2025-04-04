// Existing auth types - keep these
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';
export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_FAILURE = 'GET_USER_FAILURE';

// Add profile and user type actions
export const UPDATE_PROFILE_REQUEST = 'UPDATE_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_FAILURE = 'UPDATE_PROFILE_FAILURE';
export const SET_USER_TYPE = 'SET_USER_TYPE';
export const COMPLETE_ONBOARDING = 'COMPLETE_ONBOARDING';

// Verification actions
export const VERIFY_EMAIL_REQUEST = 'VERIFY_EMAIL_REQUEST';
export const VERIFY_EMAIL_SUCCESS = 'VERIFY_EMAIL_SUCCESS';
export const VERIFY_EMAIL_FAILURE = 'VERIFY_EMAIL_FAILURE';
export const VERIFY_PHONE_REQUEST = 'VERIFY_PHONE_REQUEST';
export const VERIFY_PHONE_SUCCESS = 'VERIFY_PHONE_SUCCESS';
export const VERIFY_PHONE_FAILURE = 'VERIFY_PHONE_FAILURE';
export const VERIFY_ID_REQUEST = 'VERIFY_ID_REQUEST';
export const VERIFY_ID_SUCCESS = 'VERIFY_ID_SUCCESS';
export const VERIFY_ID_FAILURE = 'VERIFY_ID_FAILURE';
export const GET_VERIFICATION_STATUS_REQUEST = 'GET_VERIFICATION_STATUS_REQUEST';
export const GET_VERIFICATION_STATUS_SUCCESS = 'GET_VERIFICATION_STATUS_SUCCESS';
export const GET_VERIFICATION_STATUS_FAILURE = 'GET_VERIFICATION_STATUS_FAILURE';

// Companionship actions
export const GET_COMPANIONS_REQUEST = 'GET_COMPANIONS_REQUEST';
export const GET_COMPANIONS_SUCCESS = 'GET_COMPANIONS_SUCCESS';
export const GET_COMPANIONS_FAILURE = 'GET_COMPANIONS_FAILURE';
export const REQUEST_COMPANIONSHIP_REQUEST = 'REQUEST_COMPANIONSHIP_REQUEST';
export const REQUEST_COMPANIONSHIP_SUCCESS = 'REQUEST_COMPANIONSHIP_SUCCESS';
export const REQUEST_COMPANIONSHIP_FAILURE = 'REQUEST_COMPANIONSHIP_FAILURE';

// Safety actions
export const REPORT_USER_REQUEST = 'REPORT_USER_REQUEST';
export const REPORT_USER_SUCCESS = 'REPORT_USER_SUCCESS';
export const REPORT_USER_FAILURE = 'REPORT_USER_FAILURE';
export const BLOCK_USER_REQUEST = 'BLOCK_USER_REQUEST';
export const BLOCK_USER_SUCCESS = 'BLOCK_USER_SUCCESS';
export const BLOCK_USER_FAILURE = 'BLOCK_USER_FAILURE';
export const SHARE_LOCATION_REQUEST = 'SHARE_LOCATION_REQUEST';
export const SHARE_LOCATION_SUCCESS = 'SHARE_LOCATION_SUCCESS';
export const SHARE_LOCATION_FAILURE = 'SHARE_LOCATION_FAILURE';