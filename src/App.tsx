import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/custom/Layout";
import Home from "./pages/Home";
import Other from "./pages/Other";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/other"
          element={
            <Layout>
              <Other />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}