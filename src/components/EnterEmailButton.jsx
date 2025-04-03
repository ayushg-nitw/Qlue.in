import React, { useState, useEffect } from "react";
import { db, doc, getDoc, setDoc } from "../firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import send from "../assets/svg/send.svg";

const RATE_LIMIT_KEY = btoa("qlue_rate_limit_v1").split("").reverse().join("");

const EnterEmailButton = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [bearerToken, setBearerToken] = useState(null);

  const getRateData = () => {
    try {
      const data = localStorage.getItem(RATE_LIMIT_KEY);
      return data ? JSON.parse(atob(data)) : { attempts: 0, firstAttempt: 0 };
    } catch {
      return { attempts: 0, firstAttempt: 0 };
    }
  };

  const updateRateData = (attempts, firstAttempt) => {
    const data = btoa(JSON.stringify({ attempts, firstAttempt }));
    localStorage.setItem(RATE_LIMIT_KEY, data);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const fetchBearerTokenFromFirestore = async () => {
    try {
      const tokenDoc = await getDoc(doc(db, "tokens", "verifalia"));
      if (tokenDoc.exists()) {
        setBearerToken(tokenDoc.data().accessToken);
      } else {
        console.log("No token found, generating new one...");
        return getNewBearerToken();
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const getNewBearerToken = async () => {
    const username = import.meta.env.VITE_VERAFALIA_USERNAME;
    const password = import.meta.env.VITE_VERAFALIA_PASSWORD;

    try {
      const response = await fetch(
        "https://api.verifalia.com/v2.6/auth/tokens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setBearerToken(data.accessToken);
      await setDoc(
        doc(db, "tokens", "verifalia"),
        { accessToken: data.accessToken },
        { merge: true }
      );
      return data.accessToken;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  const verifyEmail = async (email, token = bearerToken) => {
    const API_URL = "https://api.verifalia.com/v2.6/email-validations";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries: [{ inputData: email }] }),
      });

      if (response.status === 401) {
        const newToken = await getNewBearerToken();
        return newToken ? verifyEmail(email, newToken) : false;
      }

      const result = await response.json();
      return result.entries?.data[0]?.classification !== "Undeliverable";
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!bearerToken) fetchBearerTokenFromFirestore();
  }, [bearerToken]);

  const handleClick = async () => {
    const { attempts, firstAttempt } = getRateData();
    const currentTime = Date.now();
    const timeElapsed = currentTime - firstAttempt;

    // Reset if 7 minutes passed
    if (attempts >= 3 && timeElapsed > 420000) {
      updateRateData(0, 0);
    }

    // Block if over limit
    if (attempts >= 3) {
      const remaining = Math.ceil((420000 - timeElapsed) / 60000);
      toast.error(`Too many attempts. Please try again later!`, {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
      return;
    }

    updateRateData(attempts + 1, attempts === 0 ? currentTime : firstAttempt);

    if (!email) {
      toast.error("Please enter an email!", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email address!", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const isEmailValid = await verifyEmail(email);
      if (!isEmailValid) {
        toast.error("Email does not exist!", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
        setIsSubmitting(false);
        setEmail("");
        setIsFocused(false);
        return;
      }

      const userRef = doc(db, "waitlist", email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        toast.info("You're already on the waitlist!", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      } else {
        await setDoc(userRef, { email, createdAt: new Date() });
        toast.success("Joined! Welcome to the Qlue Club.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
    } finally {
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-md overflow-hidden shadow-lg">
      <div className="relative flex w-full border border-white h-auto rounded-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(email.length > 0)}
          className="w-full h-[50px] bg-transparent text-white pl-6 pr-1 text-[18px] outline-none font-gilroy transition-shadow duration-300 focus:shadow-lg tracking-[2px]"
          disabled={isSubmitting}
        />
        <label
          className={`absolute top-3 text-white lg:text-[20px] md:text-[18px] text-[16px] ml-[22%] lg:ml-[24%] transition-opacity duration-300 ${
            isFocused ? "opacity-0" : "opacity-100"
          } pointer-events-none`}
        >
          enter your email
        </label>

        <button
          onClick={handleClick}
          disabled={isSubmitting}
          className="rounded-full bg-white w-15 flex items-center justify-center transition-transform hover:scale-105"
        >
          {isSubmitting ? (
            <div className="bg-white rounded-full shadow-lg flex flex-col items-center">
              <div className="animate-spin h-6 w-6 border-t-4 border-black mt-1 border-solid rounded-full"></div>
            </div>
          ) : (
            <img src={send} className="h-10 w-10" alt="Submit" />
          )}
        </button>
      </div>
    </div>
  );
};

export default EnterEmailButton;
