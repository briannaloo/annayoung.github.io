/*
File: sortByPeers.c
Author: Anna Young
*/

import java.io.*;
import java.util.*;

public class sortByPeers
{
	public static void main(String[] args) throws IOException 
	{
		// read in data
		//String file = "original data/peer data rotated.csv";
		String file = "./peers_with_survey_Mar2015.csv";
		Scanner scan = new Scanner(new File(file));
		String header = scan.nextLine();
		String[] countries = header.split(",");
		int num_columns = countries.length - 1;

		// load countries
		double[][] matrix = new double[num_columns][num_columns];
		double[][] count_responses = new double[num_columns][num_columns];
		loadCountries(matrix, countries, scan, num_columns, count_responses);

		// print to file
		PrintWriter data = new PrintWriter("AveragedWithMutualPeers.csv", "UTF-8");
		printCSV(data, matrix, num_columns, countries);
		// mutual pair indicated by a 2

	}

	public static void loadCountries (double[][] matrix, String[] countries, Scanner scan, int length, double[][] count_responses)
	{
		//initialize
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				matrix[i][j] = 0;
				count_responses[i][j] = 0;
			}
		}

		// load country data
		while (scan.hasNextLine())						// for each country (data point)				
		{
			String line = scan.nextLine();	
			String peers[] = line.split(",");			// asked about these countries
			String country = peers[0];

			int origin = getIndex(country, countries);
			for (int i = 1; i < peers.length; i++)
			{
				int destination = i-1;
				if (peers[i].equals("1"))
				{
					if (origin != destination) {	// so no self-mutual relationships
						matrix[origin][destination] += 1;
						
					}
				}
				if (origin != destination)
					count_responses[origin][destination] += 1;
			}
		}

		// calculate the average for responses
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (count_responses[i][j] != 0) {
					double avg = matrix[i][j] / count_responses[i][j];
				
					// transform decimals/averages into yes/no/mutual (1,0,2)
					// based on if 50% responded yes
					if (avg >= 0.5) 
						matrix[i][j] = 1;
					else
						matrix[i][j] = 0;
				}
			}
		}

		// replace mutuals with a 2 not a 1
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (matrix[i][j] == 1 && matrix[j][i] == 1) {
					matrix[i][j] = 2;
					matrix[j][i] = 2;
				}
			}
		}


		

	}

	public static boolean hasData (double[][] matrix, int index, int length)
	{
		for (int i = 0; i < length; i++)
		{
			if (matrix[index][i] != 0)
				return true;
		}
		return false;
	}

	public static int getIndex(String country, String[] countries)
	{
		for (int i = 1; i < countries.length; i++)
		{
			if (countries[i].equals(country))
				return (i-1);
		}
		return -1;
	}

	public static void printCSV (PrintWriter csv, double[][] matrix, int length, String[] countries) throws IOException 
	{
		csv.print("country");
		for (int i = 1; i < countries.length; i++)
		{
			csv.print("," + countries[i]);
		}
		csv.println();

		for (int i = 0; i < length; i++)
		{
			csv.print(countries[i+1]);
			for (int j = 0; j < length; j++)
			{
				csv.print("," + matrix[i][j]);
			}
			csv.println();
		}
		csv.println();
		csv.flush();
		csv.close();
	}

}

