import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

function GoBack() {
  const navigate = useNavigate();

  const handleBack = () => {

    navigate(-1);
  };

  return (
    <Button 
      onClick={handleBack} 
      icon={<ArrowLeftOutlined />} 
      style={{ marginBottom: "20px" }}
    >
      Trở lại
    </Button>
  );
}

export default GoBack;