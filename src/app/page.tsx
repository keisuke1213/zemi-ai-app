import { Chat } from "./chat/chat";
import { MapPage } from "./map/MapPage";

export default function HomePage() {

  return (
    <div>
      <MapPage />
      <Chat />
    </div>
  );
}