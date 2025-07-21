import { Header } from "@/components/Header";
import { Workshops } from "@/components/Workshops";

export const WorkshopsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Workshops />
      </div>
    </div>
  );
};