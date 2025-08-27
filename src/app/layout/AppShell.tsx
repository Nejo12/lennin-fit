import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import styles from './AppShell.module.scss';

export default function AppShell() {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.brand}>Lennin</div>
        <nav className={styles.nav}>
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              isActive ? styles.navLink + ' ' + styles.active : styles.navLink
            }
          >
            Focus
          </NavLink>
          <NavLink
            to="/app/tasks"
            className={({ isActive }) =>
              isActive ? styles.navLink + ' ' + styles.active : styles.navLink
            }
          >
            Tasks
          </NavLink>
          <NavLink
            to="/app/invoices"
            className={({ isActive }) =>
              isActive ? styles.navLink + ' ' + styles.active : styles.navLink
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/app/leads"
            className={({ isActive }) =>
              isActive ? styles.navLink + ' ' + styles.active : styles.navLink
            }
          >
            Leads
          </NavLink>
          <NavLink
            to="/app/schedule"
            className={({ isActive }) =>
              isActive ? styles.navLink + ' ' + styles.active : styles.navLink
            }
          >
            Schedule
          </NavLink>
        </nav>
        <button
          onClick={() => supabase.auth.signOut()}
          className={styles.signOutButton}
        >
          Sign out
        </button>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
