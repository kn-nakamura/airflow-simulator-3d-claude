import { Sidebar } from './Sidebar';
import { InfoPanel } from './InfoPanel';
import { Viewport } from '../Viewport/Viewport';
import { ShortcutsOverlay } from './ShortcutsOverlay';

export function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#070b14' }}>
      <Sidebar />
      <Viewport />
      <InfoPanel />
      <ShortcutsOverlay />
    </div>
  );
}
