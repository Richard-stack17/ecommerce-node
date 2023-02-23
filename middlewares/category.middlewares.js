const Category = require('../models/category.model')

exports.validCategoryById = async (req,res,next) => {
    try{
        const {id} = req.params;
        const category = await Category.findOne({
            where:{
                id,
                status:'true',
            }
        })
        if(!category){
            return res.status(404).json({
                status:'error',
                message:'Category not found'
            })
        }
        req.category=category;
        next();
    } catch (error){
        return res.status(500).json({
            status:'error',
            message:'Internal server error',
        })
    }
} 