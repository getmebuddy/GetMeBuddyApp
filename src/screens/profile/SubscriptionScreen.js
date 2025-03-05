// src/screens/profile/SubscriptionScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, CheckBox, Divider } from 'react-native-elements';
import { 
  fetchSubscriptionPlans, 
  fetchUserSubscription,
  createCheckoutSession,
  cancelSubscription
} from '../../store/actions/monetizationActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const SubscriptionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { plans, userSubscription, loading, processingPayment } = useSelector(state => state.monetization);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Set selected plan to current subscription plan if user has one
  useEffect(() => {
    if (userSubscription && plans) {
      const currentPlan = plans.find(plan => plan.id === userSubscription.plan.id);
      if (currentPlan) {
        setSelectedPlan(currentPlan.id);
      }
    } else if (plans && plans.length > 0) {
      // Default to first plan
      setSelectedPlan(plans[0].id);
    }
  }, [userSubscription, plans]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchSubscriptionPlans()),
        dispatch(fetchUserSubscription())
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information. Please try again.');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promotion code');
      return;
    }
    
    // In a real app, you would validate the promo code with the backend
    // For now, we'll simulate a successful promo code application
    setPromoApplied(true);
    setDiscount(20); // 20% off
    Alert.alert('Success', 'Promotion code applied: 20% off your subscription!');
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }
    
    try {
      // Create checkout session
      const response = await dispatch(createCheckoutSession({
        plan_id: selectedPlan,
        promo_code: promoApplied ? promoCode : null,
        success_url: 'getmebuddy://subscription/success',
        cancel_url: 'getmebuddy://subscription/cancel'
      }));
      
      // In a real app, you would open the checkout URL in a WebView or browser
      // For now, just show a success message
      Alert.alert(
        'Success',
        'Your subscription has been processed. Welcome to Premium!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error processing subscription:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelSubscription());
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You will have access to premium features until the end of your current billing period.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderPlanFeatures = (plan) => {
    return plan.features.map((feature, index) => (
      <View key={index} style={styles.featureItem}>
        <Icon name="check" type="material" size={16} color={colors.success} />
        <Text style={styles.featureText}>{feature}</Text>
      </View>
    ));
  };

  if (loading && !plans) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </SafeAreaView>
    );
  }

  const hasActiveSubscription = userSubscription && 
    userSubscription.status === 'active' &&
    new Date(userSubscription.end_date) > new Date();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {hasActiveSubscription ? (
          <View style={styles.currentSubscriptionContainer}>
            <View style={styles.planHeader}>
              <Text style={styles.currentPlanTitle}>Your Current Plan</Text>
              <View style={styles.activeIndicator}>
                <Text style={styles.activeIndicatorText}>Active</Text>
              </View>
            </View>
            
            <View style={styles.currentPlanDetails}>
              <Text style={styles.currentPlanName}>{userSubscription.plan.name}</Text>
              <Text style={styles.currentPlanPrice}>
                ${userSubscription.plan.price} / {userSubscription.plan.interval}
              </Text>
              <Text style={styles.renewalInfo}>
                Renews on {new Date(userSubscription.end_date).toLocaleDateString()}
              </Text>
              
              <Divider style={styles.divider} />
              
              <Text style={styles.sectionSubtitle}>Your Premium Benefits</Text>
              {renderPlanFeatures(userSubscription.plan)}
              
              <Button
                title="Cancel Subscription"
                type="outline"
                buttonStyle={styles.cancelButton}
                titleStyle={styles.cancelButtonText}
                onPress={handleCancelSubscription}
                icon={
                  <Icon
                    name="close"
                    type="material"
                    size={16}
                    color={colors.error}
                    containerStyle={{ marginRight: 8 }}
                  />
                }
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Upgrade to Premium</Text>
              <Text style={styles.headerDescription}>
                Get unlimited matches, premium features, and more!
              </Text>
            </View>
            
            <View style={styles.plansContainer}>
              {plans && plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.selectedPlanCard
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.is_popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Most Popular</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceCurrency}>$</Text>
                    <Text style={styles.price}>{plan.price}</Text>
                    <View style={styles.billingInfoContainer}>
                      <Text style={styles.billingPeriod}>/ {plan.interval}</Text>
                      {promoApplied && selectedPlan === plan.id && (
                        <Text style={styles.discountText}>{discount}% off</Text>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  
                  <View style={styles.featuresContainer}>
                    {renderPlanFeatures(plan)}
                  </View>
                  
                  <View style={styles.radioContainer}>
                    <Icon
                      name={selectedPlan === plan.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                      type="material"
                      size={24}
                      color={selectedPlan === plan.id ? colors.primary : colors.grey500}
                    />
                    <Text style={[
                      styles.radioText,
                      selectedPlan === plan.id && styles.selectedRadioText
                    ]}>
                      Select Plan
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.promoContainer}>
              <Text style={styles.promoTitle}>Have a Promotion Code?</Text>
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={styles.promoInput}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="Enter code"
                  autoCapitalize="characters"
                />
                <Button
                  title="Apply"
                  buttonStyle={styles.promoButton}
                  titleStyle={styles.promoButtonText}
                  onPress={handleApplyPromo}
                  disabled={!promoCode.trim() || promoApplied}
                />
              </View>
              {promoApplied && (
                <Text style={styles.promoAppliedText}>
                  Promotion code applied! {discount}% discount.
                </Text>
              )}
            </View>
            
            <View style={styles.subscribeContainer}>
              <Button
                title="Subscribe Now"
                buttonStyle={styles.subscribeButton}
                titleStyle={styles.subscribeButtonText}
                onPress={handleSubscribe}
                disabled={!selectedPlan || processingPayment}
                loading={processingPayment}
              />
              <Text style={styles.termsText}>
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                You can cancel anytime.
              </Text>
            </View>
          </>
        )}
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Premium Benefits</Text>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" type="material" size={24} color={colors.success} />
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitTitle}>Unlimited Matches</Text>
              <Text style={styles.benefitDescription}>
                No daily limits on how many people you can match with
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" type="material" size={24} color={colors.success} />
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitTitle}>Priority Matching</Text>
              <Text style={styles.benefitDescription}>
                Your profile gets shown to more potential buddies
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" type="material" size={24} color={colors.success} />
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitTitle}>Advanced Filters</Text>
              <Text style={styles.benefitDescription}>
                Filter matches by more specific criteria
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" type="material" size={24} color={colors.success} />
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitTitle}>No Ads</Text>
              <Text style={styles.benefitDescription}>
                Enjoy an ad-free experience throughout the app
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.faqButton}
          onPress={() => navigation.navigate('SubscriptionFAQ')}
        >
          <Text style={styles.faqButtonText}>Frequently Asked Questions</Text>
          <Icon name="chevron-right" type="material" size={24} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.grey700,
    marginTop: spacing.standard,
  },
  currentSubscriptionContainer: {
    margin: spacing.standard,
  },
  currentPlanTitle: {
    ...typography.h2,
    color: colors.text,
  },
  activeIndicator: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  activeIndicatorText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  currentPlanDetails: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginTop: spacing.small,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentPlanName: {
    ...typography.h3,
    color: colors.text,
  },
  currentPlanPrice: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  renewalInfo: {
    ...typography.body,
    color: colors.grey700,
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.standard,
  },
  sectionSubtitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  cancelButton: {
    borderColor: colors.error,
    borderRadius: 25,
    marginTop: spacing.standard,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.error,
  },
  headerContainer: {
    padding: spacing.standard,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerDescription: {
    ...typography.body,
    color: colors.grey700,
    textAlign: 'center',
  },
  plansContainer: {
    padding: spacing.standard,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginBottom: spacing.standard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  planName: {
    ...typography.h2,
    color: colors.text,
  },
  popularBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  popularText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.small,
  },
  priceCurrency: {
    ...typography.h3,
    color: colors.primary,
    marginRight: spacing.xs / 2,
  },
  price: {
    ...typography.h1,
    color: colors.primary,
  },
  billingInfoContainer: {
    marginLeft: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  billingPeriod: {
    ...typography.body,
    color: colors.grey700,
  },
  discountText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  planDescription: {
    ...typography.body,
    color: colors.grey700,
    marginBottom: spacing.standard,
  },
  featuresContainer: {
    marginBottom: spacing.standard,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.small,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioText: {
    ...typography.button,
    color: colors.grey700,
    marginLeft: spacing.xs,
  },
  selectedRadioText: {
    color: colors.primary,
  },
  promoContainer: {
    padding: spacing.standard,
  },
  promoTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    ...typography.body,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.grey300,
    borderRadius: 8,
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    marginRight: spacing.small,
    backgroundColor: colors.white,
  },
  promoButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.standard,
  },
  promoButtonText: {
    ...typography.button,
  },
  promoAppliedText: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.small,
  },
  subscribeContainer: {
    padding: spacing.standard,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.small,
    width: '100%',
  },
  subscribeButtonText: {
    ...typography.button,
    fontSize: 18,
  },
  termsText: {
    ...typography.caption,
    color: colors.grey600,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  benefitsContainer: {
    padding: spacing.standard,
    backgroundColor: colors.white,
    marginHorizontal: spacing.standard,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  benefitsTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.standard,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: spacing.standard,
    alignItems: 'flex-start',
  },
  benefitDetails: {
    marginLeft: spacing.small,
    flex: 1,
  },
  benefitTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  benefitDescription: {
    ...typography.caption,
    color: colors.grey700,
  },
  faqButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.standard,
    padding: spacing.standard,
    borderRadius: 10,
    marginBottom: spacing.extraLarge,
  },
  faqButtonText: {
    ...typography.subtitle,
    color: colors.primary,
  },
});

export default SubscriptionScreen;