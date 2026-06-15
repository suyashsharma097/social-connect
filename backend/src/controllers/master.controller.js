import masterRepository from '../repositories/master.repository.js';
import logger from '../config/logger.js';

const getDepartments = async (req, res, next) => {
  try {
    const departments = await masterRepository.getDepartments();
    res.status(200).json({
      status: 'success',
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    logger.info(`Creating department: ${req.body.name}`);
    const department = await masterRepository.createDepartment(req.body);
    res.status(201).json({
      status: 'success',
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

const getSkills = async (req, res, next) => {
  try {
    const skills = await masterRepository.getSkills();
    res.status(200).json({
      status: 'success',
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    logger.info(`Creating skill: ${req.body.name}`);
    const skill = await masterRepository.createSkill(req.body);
    res.status(201).json({
      status: 'success',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDepartments,
  createDepartment,
  getSkills,
  createSkill,
};
