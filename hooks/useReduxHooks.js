import { useDispatch, useSelector } from "react-redux";

/** Thin wrappers so components import hooks from one place (@/hooks/useReduxHooks). */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
