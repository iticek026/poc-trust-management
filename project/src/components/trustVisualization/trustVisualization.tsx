import { TrustDataProvider } from "../../logic/tms/trustDataProvider";

type Props = {
  trustDataProvider: TrustDataProvider;
};

export const TrustVisualization: React.FC<Props> = ({ trustDataProvider }) => {
  const trustData = trustDataProvider.getTrustData();
  return (
    <div>
      id: {trustData.id} trust: {trustData.trust}
    </div>
  );
};
