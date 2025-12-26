import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Navbar } from "../components/navbar";
import { styles } from "../styles";
import { BProgress } from "@bprogress/core";
import "../styles/bprogress.css";
import { useEffect } from "react";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  useEffect(() => {
    if (isLoading) {
      BProgress.start();
    } else {
      BProgress.done();
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col">
      <div className={`${styles.paddingX} ${styles.flexCenter} `}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <div className="grow">
        <Outlet />
      </div>
    </div>
  );
}
