import { deleteMyReview,getMyReview,listReviews,saveMyReview,setHelpful } from "../services/reviewService.js";

export async function list(req,res) {
    const {type,id}=req.valid.params;
    const {sort,page}=req.valid.query;

    res.json(await listReviews(type,id,{sort,page,viewerId: req.user?.id ?? null}));
}

export async function mine(req,res){
    const {type,id}=req.valid.params;

    res.json({review: await getMyReview(req.user.id,type,id)});
}

export async function save(req,res) {
    const {type,id} =req.valid.params;
    const {rating,text,containsSpoilers}=req.body;

    const {created,review,watchlist}=await saveMyReview(req.user.id,type,id, {
        rating,
        text,
        containsSpoilers,
    });

    res.status(created ? 201 : 200).json({review,watchlist});
}

export async function remove(req, res) {
  const { type, id } = req.valid.params;

  await deleteMyReview(req.user.id, type, id);
  res.status(204).end();
}

export async function voteHelpful(req, res) {
  res.json(await setHelpful(req.user.id, req.valid.params.reviewId, true));
}

export async function unvoteHelpful(req, res) {
  res.json(await setHelpful(req.user.id, req.valid.params.reviewId, false));
}