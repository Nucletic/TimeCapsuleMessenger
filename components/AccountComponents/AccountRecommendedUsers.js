import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import RecommendedSearchCard from '../SearchComponents/RecommendedSearchCard'
import { Height } from '../../utils/constants'
import { getUserRecommendation } from '../../services/userService'

const AccountRecommendedUsers = () => {

  const [recommendedUsers, setRecommendedUsers] = useState([]);

  const fetchRecommendedUsers = async () => {
    const recommendations = await getUserRecommendation();
    setRecommendedUsers(recommendations);
  }

  useEffect(() => {
    fetchRecommendedUsers();
  }, [])

  return (
    <>
      {recommendedUsers.length > 0 &&
        <View style={styles.RecommendedUsersContainer}>
          <Text style={styles.RecommendedUsersTitle}>Suggested for you</Text>
          <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.RecommendedUsersContent}>
            {recommendedUsers.map((user, i) => {
              return (
                <RecommendedSearchCard key={i} userId={user.userId} profileImage={user.profileImage} username={user.username} />
              )
            })}
          </ScrollView>
        </View>}
    </>
  )
}

export default AccountRecommendedUsers

const styles = StyleSheet.create({
  RecommendedUsersContainer: {
    backgroundColor: '#fff',
    height: '100%',
  },
  RecommendedUsersContent: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: moderateScale(22),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
  RecommendedUsersTitle: {
    fontSize: Height * 0.02,
    fontWeight: '700',
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(16),
    marginHorizontal: moderateScale(16),
  },
});