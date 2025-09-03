// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMCfHUCjpRY1P06r7kz7_hEu5SYigYwEw",
  authDomain: "maheshwari-otp.firebaseapp.com",
  projectId: "maheshwari-otp",
  storageBucket: "maheshwari-otp.firebasestorage.app",
  messagingSenderId: "972875670840",
  appId: "1:972875670840:web:d3395c8e4091c9cd944dcd",
  measurementId: "G-LGSD4E6H34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Function to setup reCAPTCHA
export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return window.recaptchaVerifier;
};

// Function to send OTP
export const sendOTP = async (phoneNumber) => {
  try {
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { success: true, confirmationResult };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message };
  }
};

// Function to verify OTP
export const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message };
  }
};