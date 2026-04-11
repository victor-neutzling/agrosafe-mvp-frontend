import { createBrowserRouter } from "react-router";
import AccessVerification from "./pages/access-verification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AccessVerification />,
  },
]);

export default router;
