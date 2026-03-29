import { createBrowserRouter } from "react-router";
import Placeholder from "./pages/placeholder";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Placeholder />,
  },
]);

export default router;
