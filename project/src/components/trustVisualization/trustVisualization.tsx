import { Robot } from "../../logic/robot/robot";
import { TrustDataProvider } from "../../logic/tms/trustDataProvider";
import RobotList from "./components/RobotList";

type Props = {
  trustDataProvider: TrustDataProvider;
};

export const TrustVisualization: React.FC<Props> = ({ trustDataProvider }) => {
  // const trustData = trustDataProvider.getTrustData();
  return (
    <RobotList />
    // <div>
    //   id: {trustData.id} trust: {trustData.trust}
    // </div>
  );
};
