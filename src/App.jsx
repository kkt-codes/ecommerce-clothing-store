/* import { BrowserRouter as Router } from "react-router-dom"; */
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SignupSigninModal from "./components/SignupSigninModal";

function App() {
  return (
    <>
      {/* Navbar always visible */}
      <Navbar />

      {/* Signup / Signin Modal always mounted */}
      <SignupSigninModal />

      {/* All page routes */}
      <AppRoutes />

      {/* Footer always visible */}
      <Footer />
    </>
  );
}

export default App;
