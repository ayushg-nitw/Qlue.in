import React, { useState } from "react";
import googleImage from "../assets/svg/google.svg";
import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  setDoc,
  getDoc, // Import to check Firestore document
} from "../firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const GoogleSignInButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    setIsSubmitting(true);
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("User Info:", user);

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // If user already exists, show message
        toast.info(" You're already on the waitlist. Stay tuned!", {
          position: "top-center",
          autoClose: 3000, // Automatically close after 3s,
          style: {
            background: "#ffffff", // White background
            color: "#000000", // Black text
          },
        });
      } else {
        // Store user data in Firestore
        await setDoc(
          userRef,
          {
            name: user.displayName,
            email: user.email,
            profilePic: user.photoURL,
            uid: user.uid,
            createdAt: new Date(),
          },
          { merge: true }
        );

        // Show success toast
        toast.success(
          "Welcome to Qlue! You've successfully joined the waitlist.",
          {
            position: "top-center",
            autoClose: 3000,
            style: {
              background: "#ffffff", // White background
              color: "#000000", // Black text
            },
          }
        );
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);

      // Handle specific error when user closes popup
      if (error.code === "auth/popup-closed-by-user") {
        toast.warning("Sign-in was canceled. Try again!", {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: "#ffffff", // White background
            color: "#000000", // Black text
          },
        });
        setIsSubmitting(false);
        return;
      }

      // General error message
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: "#ffffff", // White background
          color: "#000000", // Black text
        },
      });
    }
    setIsSubmitting(false); // Ensure it's reset in all cases
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-transparent p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-t-4 border-white-500 border-solid rounded-full"></div>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className="relative w-full h-[50px] rounded-full overflow-hidden bg-white border border-black shadow-md flex items-center justify-center gap-2  transition-opacity duration-200"
      >
        {/* Google Icon */}
        <img src={googleImage} alt="Google" className="w-6 h-6" />

        {/* Button Text */}
        <span className="text-black lg:text-[20px] md:text-[18px] text-[16px] font-gilroy ">
          {isSubmitting ? "Signing in..." : "continue with google"}
        </span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
