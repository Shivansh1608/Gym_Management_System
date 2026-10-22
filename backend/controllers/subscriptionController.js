const Subscription = require('../models/Subscription');

// ------------------ CREATE SUBSCRIPTION ------------------
exports.createSubscription = async (req, res) => {
    try {
        const { plan, endDate } = req.body;

        const subscriptionData = {
            user: req.user.id,
            plan,
            endDate
        };

        const createdSubscription = await Subscription.create(subscriptionData);

        return res.json(createdSubscription);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// ------------------ GET USER SUBSCRIPTIONS ------------------
exports.getSubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const userSubscriptions = await Subscription.find({ user: userId });

        return res.json(userSubscriptions);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};
