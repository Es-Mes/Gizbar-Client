import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import useAuth from "../../hooks/useAuth"

export const RequireAuth = ({ allowRoles }) => {
  const { token, isInitialized } = useSelector((state) => state.auth)
  const location = useLocation()
  const { roles } = useAuth()

  if (!isInitialized) {
    return <p>טוען...</p> // אפשר גם Spinner
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userAllowed = allowRoles.includes(roles)
  if (!userAllowed) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RequireAuth
