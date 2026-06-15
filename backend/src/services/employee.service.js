import employeeRepository from '../repositories/employee.repository.js';
import AppError from '../utils/appError.js';

const getEmployeeById = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw new AppError('Employee not found.', 404);
  }
  return employee;
};

const createEmployee = async (body, files) => {
  // If email already exists in employees
  const existingEmployee = await employeeRepository.findByEmail(body.email);
  if (existingEmployee) {
    throw new AppError('Employee with this email already exists.', 400);
  }

  // Handle file uploads
  let profileImage = null;
  let resumePath = null;
  let documents = [];

  if (files) {
    if (files.profileImage && files.profileImage[0]) {
      profileImage = `/uploads/${files.profileImage[0].filename}`;
    }
    if (files.resume && files.resume[0]) {
      resumePath = `/uploads/${files.resume[0].filename}`;
    }
    if (files.documents) {
      documents = files.documents.map((f) => `/uploads/${f.filename}`);
    }
  }

  // Parse skills
  let skillsList = [];
  if (body.skills) {
    try {
      skillsList = JSON.parse(body.skills);
    } catch (e) {
      // If it's already an array/object, use it directly or ignore parse error
      if (Array.isArray(body.skills)) {
        skillsList = body.skills;
      }
    }
  }

  const employeeData = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    departmentId: body.departmentId || null,
    hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
    salary: parseFloat(body.salary),
    status: body.status || 'ACTIVE',
    profileImage,
    resumePath,
    documents,
  };

  return employeeRepository.createEmployee(employeeData, skillsList);
};

const updateEmployee = async (id, body, files) => {
  const employee = await getEmployeeById(id);

  // Handle files
  let profileImage = employee.profileImage;
  let resumePath = employee.resumePath;
  let documents = employee.documents;

  if (files) {
    if (files.profileImage && files.profileImage[0]) {
      profileImage = `/uploads/${files.profileImage[0].filename}`;
    }
    if (files.resume && files.resume[0]) {
      resumePath = `/uploads/${files.resume[0].filename}`;
    }
    if (files.documents) {
      const newDocs = files.documents.map((f) => `/uploads/${f.filename}`);
      documents = [...documents, ...newDocs];
    }
  }

  // Parse skills
  let skillsList = null;
  if (body.skills) {
    try {
      skillsList = JSON.parse(body.skills);
    } catch (e) {
      if (Array.isArray(body.skills)) {
        skillsList = body.skills;
      }
    }
  }

  const employeeData = {
    firstName: body.firstName || employee.firstName,
    lastName: body.lastName || employee.lastName,
    email: body.email || employee.email,
    phone: body.phone !== undefined ? body.phone : employee.phone,
    departmentId: body.departmentId !== undefined ? (body.departmentId || null) : employee.departmentId,
    hireDate: body.hireDate ? new Date(body.hireDate) : employee.hireDate,
    salary: body.salary !== undefined ? parseFloat(body.salary) : employee.salary,
    status: body.status || employee.status,
    profileImage,
    resumePath,
    documents,
  };

  return employeeRepository.updateEmployee(id, employeeData, skillsList);
};

const deleteEmployee = async (id) => {
  await getEmployeeById(id);
  return employeeRepository.deleteEmployee(id);
};

const getAllEmployees = async (query) => {
  return employeeRepository.findAll(query);
};

export default {
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
};
