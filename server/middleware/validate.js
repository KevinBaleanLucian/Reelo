export function validate(schema){
    return (req,res,next)=>{
        const result=schema.safeParse(req.body);

        if(!result.success){
            const errors={};

            for( const issue of result.error.issues){
                const field=issue.path.join('.');
                if(!errors[field]){
                    errors[field]=issue.message;
                }
            }
            return res.status(400).json({message: 'Validation failed',errors});
        }
        req.body=result.data;
        next();
    };
}

export function validateRequest(schemas){
    return (req,res,next) => {
        const errors={};
        req.valid={};

        for (const source of ['params','query']){
            if(!schemas[source]) continue;

            const result =schemas[source].safeParse(req[source]);
            if(result.success){
                req.valid[source]=result.data;
            } else {
                for (const issue of result.error.issues){
                    const field=issue.path.join('.');
                    if(!errors[field]) errors[field] = issue.message;
                }
            }
        }
        if(Object.keys(errors).length>0){
            return res.status(400).json({message: 'Validation failed',errors});
        }
        next();
    }
}