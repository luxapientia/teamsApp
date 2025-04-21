import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import OrganizationalDevelopmentTeam from './org_dev_team';
import TrainingCoursesManagement from './training_course_management';
import EnableEmployeesDevelopment from './enable_employee_dev';
import AnnualOrganizationDevelopmentPlans from './annual_org_dev_plan';
import EmployeesTraining from './employee_training';
import MyTrainingDashboard from './my_training_dashboard';
// import { useAppDispatch } from '../../hooks/useAppDispatch';
// import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';

const MyPerformanceAgreement: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     dispatch(fetchAnnualTargets());
//   }, [dispatch]);

  return (
    <Box>
      {selectedTab === 'Organization Development Team' && <OrganizationalDevelopmentTeam />}
      {selectedTab === 'Enable Employees Development' && <EnableEmployeesDevelopment />}
      {selectedTab === 'Training & Courses Management' && <TrainingCoursesManagement />}
      {selectedTab === 'Annual Organization Development Plans' && <AnnualOrganizationDevelopmentPlans />}
      {selectedTab === 'Employees Training' && <EmployeesTraining />}
      {selectedTab === 'My Training Dashboard' && <MyTrainingDashboard />}
    </Box>
  );
};

export default MyPerformanceAgreement; 
